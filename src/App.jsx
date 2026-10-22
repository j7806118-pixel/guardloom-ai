import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import BrandRulesPage from "./pages/BrandRulesPage";
import DashboardPage from "./pages/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { RulesProvider } from "./state/RulesContext";

export default function App() {
  return (
    <BrowserRouter>
      <RulesProvider>
        <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="brand-rules" element={<BrandRulesPage />} />
          <Route
            path="content-review"
            element={
              <PlaceholderPage
                title="Content Review"
                description="Bring a draft and choose the brand guidance you want to check it against."
              />
            }
          />
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
      </RulesProvider>
    </BrowserRouter>
  );
}
