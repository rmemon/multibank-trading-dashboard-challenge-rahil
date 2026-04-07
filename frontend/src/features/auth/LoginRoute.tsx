import { Navigate } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { useAuth } from "./useAuth";

export function LoginRoute() {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) {
    return (
      <div className="auth-boot" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">Loading session</span>
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}
