import { Navigate } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { useAuth } from "./useAuth";

export function LoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}
