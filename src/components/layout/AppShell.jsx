import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { navItems } from "../../data/demo";
import Notice from "../ui/Notice";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell() {
  const location = useLocation();
  const [navState, setNavState] = useState({ open: false, path: location.pathname });
  const navOpen = navState.open && navState.path === location.pathname;
  const current = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  );

  function closeNav() {
    setNavState({ open: false, path: location.pathname });
  }

  function toggleNav() {
    setNavState({ open: !navOpen, path: location.pathname });
  }

  useEffect(() => {
    if (!navOpen) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setNavState({ open: false, path: location.pathname });
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen, location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={navOpen} onClose={closeNav} />
      {navOpen ? (
        <button className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={closeNav} />
      ) : null}
      <div className="workspace">
        <TopBar
          title={current?.label ?? "Workspace"}
          navOpen={navOpen}
          onMenu={toggleNav}
        />
        <main className="page">
          <Notice />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
