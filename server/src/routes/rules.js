import { Router } from "express";
import BrandRule, { presentRule } from "../models/BrandRule.js";
import { isDuplicateKeyError, parseRule } from "../validateRule.js";

const router = Router();

function ruleId(param) {
  return decodeURIComponent(param).trim().toUpperCase();
}

router.get("/", async (_request, response, next) => {
  try {
    const rules = await BrandRule.find().sort({ id: 1 });
    response.json(rules.map(presentRule));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const parsed = parseRule(request.body);
    if (Object.keys(parsed.errors).length > 0) {
      response.status(400).json({
        message: "Check the rule fields and try again.",
        errors: parsed.errors,
      });
      return;
    }

    const created = await BrandRule.create(parsed.value);
    response.status(201).json(presentRule(created));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      response.status(409).json({
        message: "That rule ID is already in use.",
        errors: { id: "That rule ID is already in use." },
      });
      return;
    }

    next(error);
  }
});

router.patch("/:id/active", async (request, response, next) => {
  try {
    if (typeof request.body?.active !== "boolean") {
      response.status(400).json({
        message: "Choose whether the rule is active.",
        errors: { active: "Choose whether the rule is active." },
      });
      return;
    }

    const updated = await BrandRule.findOneAndUpdate(
      { id: ruleId(request.params.id) },
      { active: request.body.active },
      { returnDocument: "after", runValidators: true },
    );

    if (!updated) {
      response.status(404).json({ message: "Rule not found." });
      return;
    }

    response.json(presentRule(updated));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (request, response, next) => {
  try {
    const originalId = ruleId(request.params.id);
    const parsed = parseRule(request.body);
    if (Object.keys(parsed.errors).length > 0) {
      response.status(400).json({
        message: "Check the rule fields and try again.",
        errors: parsed.errors,
      });
      return;
    }

    if (parsed.value.id !== originalId) {
      const duplicate = await BrandRule.exists({ id: parsed.value.id });
      if (duplicate) {
        response.status(409).json({
          message: "That rule ID is already in use.",
          errors: { id: "That rule ID is already in use." },
        });
        return;
      }
    }

    let updated;
    try {
      updated = await BrandRule.findOneAndUpdate({ id: originalId }, parsed.value, {
        returnDocument: "after",
        runValidators: true,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        response.status(409).json({
          message: "That rule ID is already in use.",
          errors: { id: "That rule ID is already in use." },
        });
        return;
      }

      throw error;
    }

    if (!updated) {
      response.status(404).json({ message: "Rule not found." });
      return;
    }

    response.json(presentRule(updated));
  } catch (error) {
    next(error);
  }
});

export default router;
