import { useState } from "react";
import LandingPage from "./components/LandingPage";
import AdminLogin from "./components/AdminLogin";
import MainAdminPanel from "./components/MainAdminPanel";
import WardAdminPanel from "./components/WardAdminPanel";
import CitizenPortal from "./components/CitizenPortal";
import CollectorApp from "./components/CollectorApp";
import SuperAdminPanel from "./components/SuperAdminPanel";
import BusinessPortal from "./components/BusinessPortal";

type Page = "landing" | "admin-login" | "main-admin" | "ward-admin" | "citizen" | "collector" | "super-admin" | "business";

interface AppState {
  page: Page;
  wardId?: number;
}

export default function App() {
  const [state, setState] = useState<AppState>({ page: "landing" });

  const navigate = (page: string) => {
    if (page === "admin") setState({ page: "admin-login" });
    else setState({ page: page as Page });
  };

  const handleLogin = (role: "city" | "ward", wardId?: number) => {
    if (role === "city") setState({ page: "main-admin" });
    else setState({ page: "ward-admin", wardId });
  };

  const handleLogout = () => setState({ page: "admin-login" });

  switch (state.page) {
    case "admin-login":
      return <AdminLogin onLogin={handleLogin} onNavigate={navigate} />;
    case "main-admin":
      return <MainAdminPanel onLogout={handleLogout} />;
    case "super-admin":
      return <SuperAdminPanel onLogout={() => setState({ page: "citizen" })} />;
    case "ward-admin":
      return <WardAdminPanel wardId={state.wardId ?? 1} onLogout={handleLogout} />;
    case "citizen":
      return <CitizenPortal onNavigate={navigate} />;
    case "collector":
      return <CollectorApp onNavigate={navigate} />;
    case "business":
      return <BusinessPortal onNavigate={navigate} />;
    default:
      return <LandingPage onNavigate={navigate} />;
  }
}
