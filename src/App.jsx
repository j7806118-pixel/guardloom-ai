import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import BrandRulesPage from "./pages/BrandRulesPage";
import ContentReviewPage from "./pages/ContentReviewPage";
import DashboardPage from "./pages/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { DraftProvider } from "./state/DraftContext";
import { RulesProvider } from "./state/RulesContext";

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
                element={
                  <PlaceholderPage
                    title="Analysis Results"
                    description="Autumn launch email · DR-024 · Demonstration review"
                  />
                }
              />
            </Route>
          </Routes>
        </DraftProvider>
      </RulesProvider>
    </BrowserRouter>
  );
}
