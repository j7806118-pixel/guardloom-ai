import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import rulesRouter from "./routes/rules.js";
import reviewRouter from "./routes/review.js";
import reviewsRouter from "./routes/reviews.js";
import { seedBrandRules } from "./seedBrandRules.js";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(serverRoot, ".env"), quiet: true });

const app = express();
const rawPort = process.env.PORT;
let port = 3000;
if (rawPort !== undefined && rawPort !== "") {
  const parsedPort = Number(rawPort);
  if (
    !Number.isInteger(parsedPort) ||
    parsedPort <= 0 ||
    parsedPort > 65535
  ) {
    console.error("Configuration error: PORT must be a valid port number between 1 and 65535.");
    process.exit(1);
  }
  port = parsedPort;
}


app.use(helmet());
app.use(cors({
  origin: [
    "https://guardloom-ai.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "guardloom-api" });
});

app.use("/api/rules", rulesRouter);
app.use("/api/review", reviewRouter);
app.use("/api/reviews", reviewsRouter);

app.use((error, _request, response, _next) => {
  if (error.type === "entity.too.large") {
    response.status(413).json({ message: "Request body is too large." });
    return;
  }
  if (error instanceof SyntaxError && error.status === 400) {
    response.status(400).json({ message: "Request body must be valid JSON." });
    return;
  }

  console.error("Request failed:", error.message);
  response.status(500).json({ message: "The request could not be completed." });
});

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

console.log(
  "MongoDB URI loaded:",
  Boolean(process.env.MONGODB_URI)
);

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected.");
});

try {
  await mongoose.connect(uri);
  console.log("MongoDB connected");
} catch (error) {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
}

try {
  await seedBrandRules();
} catch {
  console.error("Brand rules could not be prepared");
  process.exit(1);
}

app.listen(port, () => {
  console.log(`guardloom-api listening on http://localhost:${port}`);
});
