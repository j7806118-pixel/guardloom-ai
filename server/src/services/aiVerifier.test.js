import { strict as assert } from "node:assert";
import { verifyAiFinding } from "./aiVerifier.js";

function testAiVerifier() {
  console.log("Running AI verifier tests...");

  const validRuleIds = new Set(["AW-001", "AW-002", "AW-003"]);
  const content = "Welcome to our new command center and workspace platform. Enjoy the launch!";

  // 1. Valid evidence and valid selected rule ID
  const finding1 = {
    ruleId: "AW-002",
    severity: "Medium",
    evidence: "command center",
    explanation: "Use workspace instead.",
    suggestedFix: "Change to workspace.",
  };
  assert.equal(verifyAiFinding(finding1, content, validRuleIds), true);

  // 2. Missing, invalid, and unselected rule IDs
  const findingMissingRule = { ...finding1, ruleId: undefined };
  assert.equal(verifyAiFinding(findingMissingRule, content, validRuleIds), false);

  const findingInvalidRule = { ...finding1, ruleId: 123 };
  assert.equal(verifyAiFinding(findingInvalidRule, content, validRuleIds), false);

  const findingUnselectedRule = { ...finding1, ruleId: "AW-999" };
  assert.equal(verifyAiFinding(findingUnselectedRule, content, validRuleIds), false);

  // 3. Evidence not present in submitted content
  const findingBadEvidence = { ...finding1, evidence: "nonexistent phrase" };
  assert.equal(verifyAiFinding(findingBadEvidence, content, validRuleIds), false);

  // 4. Empty evidence
  const findingEmptyEvidence = { ...finding1, evidence: "   " };
  assert.equal(verifyAiFinding(findingEmptyEvidence, content, validRuleIds), false);

  // 5. Case-insensitive and whitespace-normalized matching
  const findingWhitespace = { ...finding1, evidence: "NEW  command\ncenter" };
  assert.equal(verifyAiFinding(findingWhitespace, content, validRuleIds), true);

  const findingCase = { ...finding1, evidence: "COMMAND CENTER" };
  assert.equal(verifyAiFinding(findingCase, content, validRuleIds), true);

  // 6. Mixed valid and invalid AI findings filtering simulation
  const rawAiFindings = [
    finding1, // valid
    { ...finding1, ruleId: "AW-999" }, // unselected rule -> invalid
    { ...finding1, evidence: "hallucinated text" }, // missing evidence -> invalid
    { ...finding1, ruleId: "AW-003", evidence: "workspace" }, // valid
  ];

  const filteredAiFindings = rawAiFindings.filter((f) => verifyAiFinding(f, content, validRuleIds));
  assert.equal(filteredAiFindings.length, 2);
  assert.equal(filteredAiFindings[0].ruleId, "AW-002");
  assert.equal(filteredAiFindings[1].ruleId, "AW-003");

  console.log("All AI verifier tests passed successfully!");
}

testAiVerifier();
