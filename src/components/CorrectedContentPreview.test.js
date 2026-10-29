import { strict as assert } from "node:assert";
import { computeCorrectedContent } from "../utils/correctedContent.js";

function testCorrectedContentPreview() {
  console.log("Running CorrectedContentPreview logic tests...");

  const draft = "Welcome to our new command center. Check out Aster Projects today!";

  // Test 1: Accepted finding uses suggestedFix
  const findings1 = [
    {
      ruleId: "AW-002",
      evidence: "command center",
      suggestedFix: "workspace",
      decision: "accepted",
    },
  ];
  const res1 = computeCorrectedContent(draft, findings1);
  assert.equal(
    res1.correctedText,
    "Welcome to our new workspace. Check out Aster Projects today!"
  );
  assert.equal(res1.warning, null);

  // Test 2: Edited finding uses revisedText
  const findings2 = [
    {
      ruleId: "AW-002",
      evidence: "command center",
      suggestedFix: "workspace",
      revisedText: "central hub",
      decision: "edited",
    },
  ];
  const res2 = computeCorrectedContent(draft, findings2);
  assert.equal(
    res2.correctedText,
    "Welcome to our new central hub. Check out Aster Projects today!"
  );
  assert.equal(res2.warning, null);

  // Test 3: Dismissed finding preserves original wording
  const findings3 = [
    {
      ruleId: "AW-002",
      evidence: "command center",
      suggestedFix: "workspace",
      decision: "dismissed",
    },
  ];
  const res3 = computeCorrectedContent(draft, findings3);
  assert.equal(res3.correctedText, draft);
  assert.equal(res3.warning, null);

  // Test 4: Pending findings remain unresolved
  const findings4 = [
    {
      ruleId: "AW-002",
      evidence: "command center",
      suggestedFix: "workspace",
      decision: "pending",
    },
  ];
  const res4 = computeCorrectedContent(draft, findings4);
  assert.equal(res4.correctedText, draft);
  assert.equal(res4.warning, null);

  // Test 5: No findings allows copying original draft
  const res5 = computeCorrectedContent(draft, []);
  assert.equal(res5.correctedText, draft);
  assert.equal(res5.warning, null);

  // Test 6: Multiple findings and preservation of unaffected text
  const findings6 = [
    {
      ruleId: "AW-002",
      evidence: "command center",
      suggestedFix: "workspace",
      decision: "accepted",
    },
    {
      ruleId: "AW-006",
      evidence: "Aster Projects",
      suggestedFix: "GuardLoom Platform",
      decision: "accepted",
    },
  ];
  const res6 = computeCorrectedContent(draft, findings6);
  assert.equal(
    res6.correctedText,
    "Welcome to our new workspace. Check out GuardLoom Platform today!"
  );

  // Test 7: Ambiguous/multiple evidence match emits warning and skips replacement safely
  const ambiguousDraft = "command center is a command center.";
  const findings7 = [
    {
      ruleId: "AW-002",
      evidence: "command center",
      suggestedFix: "workspace",
      decision: "accepted",
    },
  ];
  const res7 = computeCorrectedContent(ambiguousDraft, findings7);
  assert.equal(res7.correctedText, ambiguousDraft);
  assert.ok(res7.warning.includes("Ambiguous evidence span"));
  console.log("All CorrectedContentPreview logic tests passed successfully!");
}
testCorrectedContentPreview();