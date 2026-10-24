import { useCallback, useEffect, useMemo, useState } from "react";
import RulesContext from "./rules-context";

async function request(path, { fallback = "The request could not be completed.", ...options } = {}) {
  let response;

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new Error(fallback);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || fallback);
    error.details = data?.errors;
    throw error;
  }

  return data;
}

function sortRules(rules) {
  return [...rules].sort((left, right) => left.id.localeCompare(right.id));
}

export function RulesProvider({ children }) {
  const [rules, setRules] = useState([]);
  const [rulesStatus, setRulesStatus] = useState("loading");
  const [rulesError, setRulesError] = useState("");

  const fetchRules = useCallback(async (signal) => {
    const data = await request("/api/rules", {
      signal,
      fallback: "The brand rules could not be loaded.",
    });

    if (!Array.isArray(data)) {
      throw new Error("The brand rules could not be loaded.");
    }

    return data;
  }, []);

  const loadRules = useCallback(async () => {
    setRulesStatus("loading");
    setRulesError("");

    try {
      const data = await fetchRules();
      setRules(data);
      setRulesStatus("ready");
    } catch (error) {
      setRulesStatus("error");
      setRulesError(error.message || "The brand rules could not be loaded.");
    }
  }, [fetchRules]);

  useEffect(() => {
    const controller = new AbortController();

    fetchRules(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }

        setRules(data);
        setRulesStatus("ready");
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === "AbortError") {
          return;
        }

        setRulesStatus("error");
        setRulesError(error.message || "The brand rules could not be loaded.");
      });

    return () => controller.abort();
  }, [fetchRules]);

  const value = useMemo(
    () => ({
      rules,
      rulesStatus,
      rulesError,
      loadRules,
      async addRule(rule) {
        const saved = await request("/api/rules", {
          method: "POST",
          body: JSON.stringify(rule),
        });
        setRules((current) => sortRules([...current, saved]));
        return saved;
      },
      async updateRule(originalId, rule) {
        const saved = await request(`/api/rules/${encodeURIComponent(originalId)}`, {
          method: "PATCH",
          body: JSON.stringify(rule),
        });
        setRules((current) =>
          sortRules(current.map((item) => (item.id === originalId ? saved : item))),
        );
        return saved;
      },
      async setRuleActive(id, active) {
        const saved = await request(`/api/rules/${encodeURIComponent(id)}/active`, {
          method: "PATCH",
          body: JSON.stringify({ active }),
        });
        setRules((current) => current.map((item) => (item.id === id ? saved : item)));
        return saved;
      },
    }),
    [loadRules, rules, rulesError, rulesStatus],
  );

  return <RulesContext.Provider value={value}>{children}</RulesContext.Provider>;
}
