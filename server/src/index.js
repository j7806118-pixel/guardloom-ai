import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import mongoose from "mongoose";
import rulesRouter from "./routes/rules.js";
import reviewRouter from "./routes/review.js";
import { seedBrandRules } from "./seedBrandRules.js";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(serverRoot, ".env"), quiet: true });

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "guardloom-api" });
});

app.use("/api/rules", rulesRouter);
app.use("/api/review", reviewRouter);

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    response.status(400).json({ message: "Request body must be valid JSON." });
    return;
  }

  console.error("Request failed");
  response.status(500).json({ message: "The request could not be completed." });
});

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

try {
  await mongoose.connect(uri);
  console.log("MongoDB connected");
} catch {
  console.error("MongoDB connection failed");
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
