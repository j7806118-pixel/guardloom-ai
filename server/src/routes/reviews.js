import { Router } from "express";
import Review from "../models/Review.js";

const router = Router();

// POST /api/reviews - Create a new review from an existing analysis
router.post("/", async (req, res, next) => {
  try {
    const {
      title,
      contentType,
      content,
      ruleIds,
      findings,
      summary,
      reviewedAt,
      reviewMode,
    } = req.body;

    if (!title || !contentType || !content || !Array.isArray(ruleIds) || !Array.isArray(findings)) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const review = await Review.create({
     title,
     contentType,
     content,
     ruleIds,
     findings,
     summary,
     reviewedAt,
     reviewMode,
     });
    res.status(201).json(review);
  } catch (err) { next(err); }
});

// GET /api/reviews/:id - Retrieve review by ID
router.get("/:id", async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found." });
    res.json(review);
  } catch (err) { next(err); }
});

// PATCH /api/reviews/:id/findings/:findingId - Update finding decision/text
router.patch("/:id/findings/:findingId", async (req, res, next) => {
  try {
    const { decision, revisedText } = req.body;
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, "findings._id": req.params.findingId },
      {
        $set: {
          "findings.$.decision": decision,
          "findings.$.revisedText": revisedText
        }
      },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: "Review or finding not found." });
    res.json(review);
  } catch (err) { next(err); }
});

// PATCH /api/reviews/:id/status - Update overall review status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pending", "changes-requested", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found." });
    res.json(review);
  } catch (err) { next(err); }
});

export default router;