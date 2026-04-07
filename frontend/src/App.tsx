import { Navigate, Route, Routes } from "react-router-dom";
import { LoginRoute } from "./features/auth/LoginRoute";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { DashboardShell } from "./features/dashboard/DashboardShell";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
