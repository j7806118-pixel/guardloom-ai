import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="brand-rules"
            element={
              <PlaceholderPage
                title="Brand Rules"
                description="One shared source of truth for what your brand says, and how it says it."
              />
            }
          />
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
    </BrowserRouter>
  );
}
