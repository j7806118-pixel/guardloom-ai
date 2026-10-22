import { useMemo, useState } from "react";
import { initialRules } from "../data/rules";
import RulesContext from "./rules-context";

export function RulesProvider({ children }) {
  const [rules, setRules] = useState(initialRules);

  const value = useMemo(
    () => ({
      rules,
      addRule(rule) {
        setRules((current) => [...current, rule].sort((a, b) => a.id.localeCompare(b.id)));
      },
      updateRule(originalId, rule) {
        setRules((current) =>
          current
            .map((item) => (item.id === originalId ? rule : item))
            .sort((a, b) => a.id.localeCompare(b.id)),
        );
      },
      setRuleActive(id, active) {
        setRules((current) => current.map((item) => (item.id === id ? { ...item, active } : item)));
      },
    }),
    [rules],
  );

  return <RulesContext.Provider value={value}>{children}</RulesContext.Provider>;
}
