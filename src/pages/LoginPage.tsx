import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmailPassword } from "../auth.js";
import { signInWithGoogle } from "../firebase/googleAuth";
import { firebaseAuthErrorMessage } from "../firebase/phoneAuth";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  type FirebaseUserLike = {
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setError(null);
    setBusy(true);
    try {
      if (!email.trim()) {
        setError("Email is required.");
        return;
      }
      if (!password.trim()) {
        setError("Password is required.");
        return;
      }

      const result = await loginWithEmailPassword({ email, password });
      if (!result.ok) {
        setError(result.error || "Login failed.");
        return;
      }

      // Help RequireAuth immediately (AuthContext updates a moment later via onAuthStateChanged).
      const fbUser = result.user as unknown as FirebaseUserLike;
      const username =
        fbUser?.displayName ||
        fbUser?.email?.split("@")?.[0] ||
        fbUser?.phoneNumber ||
        "Member";
      localStorage.setItem(
        "equimind_current_user",
        JSON.stringify({
          username: String(username),
          email: fbUser?.email ? String(fbUser.email) : undefined,
          phone: fbUser?.phoneNumber ? String(fbUser.phoneNumber) : undefined,
        })
      );

      navigate("/home", { replace: true });
    } finally {
      setBusy(false);
      // `remember` is only a UI flag; Firebase handles sessions on its own.
      void remember;
    }
  };

  const onGoogleClick = async () => {
    if (googleBusy) return;
    setError(null);
    setGoogleBusy(true);
    try {
      const cred = await signInWithGoogle();
      const fbUser = cred.user as unknown as FirebaseUserLike;
      const username =
        fbUser?.displayName ||
        fbUser?.email?.split("@")?.[0] ||
        fbUser?.phoneNumber ||
        "Member";
      localStorage.setItem(
        "equimind_current_user",
        JSON.stringify({
          username: String(username),
          email: fbUser?.email ? String(fbUser.email) : undefined,
          phone: fbUser?.phoneNumber ? String(fbUser.phoneNumber) : undefined,
        })
      );
      navigate("/home", { replace: true });
    } catch (e) {
      setError(firebaseAuthErrorMessage(e));
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col overflow-x-hidden">
      <header className="fixed top-0 w-full z-50 px-6 py-8 flex items-center justify-between bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">
            eco
          </span>
          <span className="font-headline font-bold tracking-tighter text-primary text-xl">
            The Digital Sanctuary
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="w-10 h-10 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-primary shadow-sm"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col relative isolate pt-32 sm:pt-36 pb-12 px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[120%] h-[60%] bg-botanical opacity-20 rounded-b-[10rem] rotate-3 -translate-y-8" />
          <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-background to-transparent" />
        </div>

        <section className="relative z-10 mb-12 mt-2 scroll-mt-32">
          <h1 className="font-headline text-[3.5rem] leading-[0.9] tracking-tight font-light italic text-primary-dim mb-4">
            Return to <br />
            <span className="font-bold not-italic">the Sanctuary.</span>
          </h1>
          <p className="font-body text-on-surface-variant max-w-[280px] leading-relaxed">
            Step back into your private space for breath, focus, and restful dreaming.
          </p>
        </section>

        <section className="space-y-8 flex-1">
          <div className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block font-label text-xs uppercase tracking-widest font-semibold ml-4 text-on-surface-variant"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    id="login-email"
                    className="w-full h-16 px-6 rounded-full border-none bg-surface-container-high focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant transition-all"
                    placeholder="hello@calm.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "login-error" : undefined}
                  />
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-primary/40">
                    mail
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="block font-label text-xs uppercase tracking-widest font-semibold ml-4 text-on-surface-variant"
                >
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="login-password"
                    className="w-full h-16 px-6 rounded-full border-none bg-surface-container-high focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant transition-all"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-primary/40">
                    lock
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between px-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      className="peer sr-only"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-outline-variant peer-checked:bg-primary peer-checked:border-primary transition-all" />
                    <span className="material-symbols-outlined absolute inset-0 text-[16px] text-white hidden peer-checked:block text-center pt-0.5">
                      check
                    </span>
                  </div>
                  <span className="text-sm font-medium text-on-surface-variant">
                    Remember my vibe
                  </span>
                </label>
                <a
                  className="text-sm font-semibold text-primary underline decoration-primary/20 underline-offset-4"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot Password?
                </a>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full h-16 rounded-full bg-primary-container text-on-primary-container font-bold text-lg editorial-shadow active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-60"
                  disabled={busy}
                  aria-busy={busy}
                >
                  {busy ? "Entering…" : "Enter Sanctuary"}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                {error && (
                  <div
                    id="login-error"
                    role="alert"
                    aria-live="polite"
                    className="mt-4 text-error bg-error-container p-3 rounded-xl border border-outline-variant/20"
                  >
                    {error}
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

        <footer className="mt-auto pt-12 pb-6 text-center space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-outline-variant/20" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-outline-variant">
              Sign in with
            </span>
            <div className="h-[1px] flex-1 bg-outline-variant/20" />
          </div>
          <div className="flex justify-center w-full">
            <button
              type="button"
              className="h-14 w-full max-w-xs rounded-full bg-surface-container-lowest editorial-shadow flex items-center justify-center gap-3 px-6 text-on-surface border border-outline-variant/10"
              onClick={() => void onGoogleClick()}
              disabled={googleBusy}
              aria-busy={googleBusy}
              aria-label={googleBusy ? "Signing in with Google" : "Sign in with Google"}
            >
              <GoogleMark className="h-5 w-5 shrink-0" />
              <span className="font-label text-sm font-bold">
                {googleBusy ? "Opening…" : "Google"}
              </span>
            </button>
          </div>
          <p className="text-on-surface-variant font-medium">
            New to the space?{" "}
            <Link to="/signup" className="text-primary font-extrabold ml-1">
              Create an account
            </Link>
          </p>
        </footer>
      </main>

      <div className="fixed bottom-32 -right-8 w-40 h-40 bg-tertiary-container/10 rounded-full blur-3xl -z-10" />
      <div className="fixed top-1/4 -left-12 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl -z-10" />

      <div className="fixed bottom-24 right-6 p-4 bg-surface-container-lowest/80 backdrop-blur-xl rounded-lg editorial-shadow flex items-center gap-3 border border-outline-variant/10">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          Live Harmony
        </span>
      </div>
    </div>
  );
};

export default LoginPage;

