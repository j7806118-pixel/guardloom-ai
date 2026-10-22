import { useContext } from "react";
import RulesContext from "./rules-context";

export default function useRules() {
  const context = useContext(RulesContext);

  if (!context) {
    throw new Error("useRules must be used within RulesProvider");
  }

  return context;
}
