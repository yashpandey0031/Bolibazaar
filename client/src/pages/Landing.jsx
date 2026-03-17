import { useSelector } from "react-redux";
import { GuestLanding } from "../components/Landing/GuestLanding";
import Dashboard from "./Dashboard";
import LoadingScreen from "../components/LoadingScreen";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export const Landing = () => {
  const { user, loading } = useSelector((state) => state.auth);
  useDocumentTitle(user ? "Dashboard" : "Home");

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen">
      {!user && <GuestLanding />}
      {user && <Dashboard />}
    </div>
  );
};
