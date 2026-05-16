import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const QUOTE =
  "Life is a series of memories. That once were just simple moments";

const HomePageApp: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const username = user?.username || "there";

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-2xl">
          <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-white/50 shadow-xl p-6 lg:p-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 tracking-tight">
              Good morning <span className="text-primary-700">{username}</span>
            </h1>

            <p className="mt-4 text-lg text-surface-600 leading-relaxed">
              &quot;{QUOTE}&quot;
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => navigate("/check-in")}
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all"
                  >
                    Start Check-in
                  </button>
                  <button
                    onClick={() => navigate("/chat")}
                    className="px-8 py-4 bg-white text-surface-800 rounded-2xl font-bold text-lg border border-surface-200 hover:bg-surface-50 transition-all"
                  >
                    Open Chat
                  </button>
                  <button
                    onClick={() => {
                      void (async () => {
                        await logout();
                        navigate("/", { replace: true });
                      })();
                    }}
                    className="px-8 py-4 bg-surface-50 text-surface-700 rounded-2xl font-bold text-lg border border-surface-200 hover:bg-white transition-all"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-white text-surface-800 rounded-2xl font-bold text-lg border border-surface-200 hover:bg-surface-50 transition-all"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            <p className="mt-8 text-sm text-surface-500">
              Your check-ins help personalize your journey.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePageApp;

