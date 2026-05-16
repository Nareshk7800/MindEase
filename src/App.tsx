import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePageNew from './pages/HomePageNew';
import HomePageApp from './pages/HomePageApp';
import CheckInPageNew from './pages/CheckInPageNew';
import ChatPage from './pages/ChatPage';
import ResourcesPage from './pages/ResourcesPage';
import WellnessPage from './pages/WellnessPage';
import DashboardPage from './pages/DashboardPage';
import CrisisPage from './pages/CrisisPage';
import { CheckInProvider } from './context/CheckInContext';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuth } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <CheckInProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePageNew />} />
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <HomePageApp />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/check-in"
              element={
                <RequireAuth>
                  <CheckInPageNew />
                </RequireAuth>
              }
            />
            <Route
              path="/chat"
              element={
                <RequireAuth>
                  <ChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/resources"
              element={
                <RequireAuth>
                  <ResourcesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/wellness"
              element={
                <RequireAuth>
                  <WellnessPage />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route path="/crisis" element={<CrisisPage />} />
          </Routes>
        </Router>
      </CheckInProvider>
    </AuthProvider>
  );
}

export default App;

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    // Avoid edge-case race where navigation happens before React state updates.
    try {
      const raw = localStorage.getItem("equimind_current_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.username) return <>{children}</>;
      }
    } catch {
      // ignore
    }
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
