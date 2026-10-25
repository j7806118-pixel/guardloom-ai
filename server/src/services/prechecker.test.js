import { strict as assert } from "node:assert";
import { runPrechecker } from "./prechecker.js";

function testPrechecker() {
  console.log("Running prechecker tests...");

  const rules = [
    {
      id: "AW-002",
      title: "Call the product a workspace",
      guidance: "Use “workspace”, not “command center”.",
      severity: "Medium",
      active: true,
    },
    {
      id: "AW-006",
      title: "Use the legacy product name",
      guidance: "Archived: “Aster Projects” was retired.",
      severity: "Medium",
      active: false,
    },
    {
      id: "AW-004",
      title: "Write headings in sentence case",
      guidance: "Capitalize the first word and proper nouns only.",
      severity: "Low",
      active: true,
    },
  ];

  // Case 1: Prohibited phrase match
  const draft1 = "Welcome to our new command center.";
  const findings1 = runPrechecker(rules, draft1);
  assert.equal(findings1.length, 1);
  assert.equal(findings1[0].ruleId, "AW-002");
  assert.equal(findings1[0].evidence.toLowerCase(), "command center");

  // Case 2: Same rule with no prohibited phrase in the draft
  const draft2 = "Welcome to our new workspace.";
  const findings2 = runPrechecker(rules, draft2);
  assert.equal(findings2.length, 0);

  // Case 3: Inactive rule (AW-006 matches 'Aster Projects' but is inactive)
  const rulesInactive = [
    {
      id: "AW-006",
      title: "Use the legacy product name",
      guidance: "Use “Aster Projects”, not “Aster Works”.",
      severity: "Medium",
      active: false,
    },
  ];
  const draft3 = "Check out Aster Projects.";
  const findings3 = runPrechecker(rulesInactive, draft3);
  assert.equal(findings3.length, 0);

  // Case 4: Qualitative guidance that must be skipped
  const draft4 = "welcome to our page.";
  const findings4 = runPrechecker([rules[2]], draft4);
  assert.equal(findings4.length, 0);

  // Case 5: Similar but non-matching phrase
  const draft5 = "Welcome to our control center.";
  const findings5 = runPrechecker(rules, draft5);
  assert.equal(findings5.length, 0);

  console.log("All prechecker tests passed successfully!");
}

testPrechecker();