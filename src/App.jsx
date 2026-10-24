import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import BrandRulesPage from "./pages/BrandRulesPage";
import ContentReviewPage from "./pages/ContentReviewPage";
import AnalysisResultsPage from "./pages/AnalysisResultsPage";

import { RulesProvider } from "./state/RulesContext";
import { DraftProvider } from "./state/DraftContext";

export default function App() {
  return (
    <BrowserRouter>
      <RulesProvider>
        <DraftProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="brand-rules" element={<BrandRulesPage />} />
              <Route path="content-review" element={<ContentReviewPage />} />
              <Route
                path="analysis-results"
                element={<AnalysisResultsPage />}
              />
            </Route>
          </Routes>
        </DraftProvider>
      </RulesProvider>
    </BrowserRouter>
  );
}
