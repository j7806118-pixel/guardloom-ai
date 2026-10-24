import { useContext } from "react";
import DraftContext from "./draft-context";

export default function useDraft() {
  const context = useContext(DraftContext);

  if (!context) {
    throw new Error("useDraft must be used within DraftProvider");
  }

  return context;
}
