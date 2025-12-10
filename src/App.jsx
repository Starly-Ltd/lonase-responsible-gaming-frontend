import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SetLimitsPage from "./pages/SetLimitsPage";
import MyLimitsPage from "./pages/MyLimitsPage";
import AccueilPage from "./pages/AccueilPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<AccueilPage />} />
        <Route path="/accueil" element={<AccueilPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/set-limits"
          element={
            <ProtectedRoute>
              <SetLimitsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-limits"
          element={
            <ProtectedRoute>
              <MyLimitsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
