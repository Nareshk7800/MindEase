import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { firebaseAuthErrorMessage } from "../firebase/phoneAuth";
import { signInWithGoogle } from "../firebase/googleAuth";
import { signupWithEmailPassword } from "../auth.js";

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

function FacebookMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await signupWithEmailPassword({
        name: fullName,
        email,
        password,
      });

      if (!result.ok) {
        setError(result.error || "Signup failed.");
        return;
      }

      setSuccess("Account created successfully!");
      // Allow users to see the success message briefly.
      setTimeout(() => navigate("/home", { replace: true }), 800);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Signup failed due to an unexpected error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleClick = async () => {
    setError(null);
    setSuccess(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate("/home", { replace: true });
    } catch (e) {
      setError(firebaseAuthErrorMessage(e));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="signup-page min-h-screen relative overflow-hidden flex flex-col items-center bg-surface">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-surface z-10" />
        <img
          className="w-full h-full object-cover scale-110"
          data-alt="Dreamy forest floor with lush moss and sunbeams filtering through ancient oak trees in a soft morning mist"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtIU04DohovxqnewVJxh1uz6rZWvvxokUEuflTcOCH4aeG0iJ7xxpsfaDZCThh_oSMgCTP-rtvL-2sdDmfQT7oTfy-ST_Ls635AaYAj7WG6T79LUCkNjVHDiAPXeXy2PV95DGj9NeAFsuC1rtjrzOqL7C6DMb5GZHFuxFb4-VAnvhOh9EUs9GkjOvraWRDzEaj4bLk6cTVY0AKlmAhqmxuV5s8XrRmngvnLGkGCXtMaYOZ4bXs71yunwRf3dixtDBcUcdhiCyFRqWI"
          alt=""
        />
      </div>

      <header className="relative z-20 w-full px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" data-icon="eco">
            eco
          </span>
          <span className="font-headline font-bold tracking-tighter text-2xl text-primary">
            The Digital Sanctuary
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="w-12 h-12 rounded-full bg-surface-container-lowest editorial-shadow flex items-center justify-center hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-on-surface">close</span>
        </button>
      </header>

      <section className="relative z-20 w-full max-w-lg px-6 pb-24 mt-4">
        <div className="mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-light leading-[1.1] tracking-tight text-on-surface">
            Find Your <br />
            <span className="italic font-bold text-primary">Inner Forest.</span>
          </h1>
          <p className="mt-6 text-on-surface-variant font-body text-lg max-w-[280px]">
            Step away from the noise and begin your journey into curated tranquility.
          </p>
        </div>

        <div className="absolute -right-4 top-0 glass-panel p-4 rounded-xl editorial-shadow rotate-3 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
              Live Atmosphere
            </span>
          </div>
          <div className="mt-2 font-headline font-bold text-primary">Forest Rain</div>
        </div>

        <div className="glass-panel rounded-lg p-8 editorial-shadow border border-white/20">
          <h2 className="font-headline text-2xl font-bold mb-6">Begin Your Sanctuary</h2>

          <form className="space-y-6" onSubmit={onSubmitEmail}>
            <div className="space-y-1.5">
              <label className="block text-sm font-label font-semibold text-on-surface-variant ml-4">
                Full Name
              </label>
              <input
                className="w-full bg-surface-container-high/50 border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant text-on-surface"
                placeholder="Elias Thorne"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-label font-semibold text-on-surface-variant ml-4">
                Email
              </label>
              <input
                className="w-full bg-surface-container-high/50 border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant text-on-surface"
                placeholder="elias@sanctuary.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-label font-semibold text-on-surface-variant ml-4">
                Password
              </label>
              <input
                className="w-full bg-surface-container-high/50 border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant text-on-surface"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {(error || success) && (
              <div className="text-sm font-semibold text-red-700 bg-red-100 border border-red-200 rounded-xl p-3">
                {error || success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-headline font-bold py-5 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 disabled:opacity-60"
            >
              Start Breathing
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-xs font-label uppercase tracking-widest text-outline-variant shrink-0">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              disabled={googleLoading}
              onClick={() => void onGoogleClick()}
              className="group flex w-full min-h-[52px] items-center justify-center gap-3 rounded-full border border-outline-variant/15 bg-surface-container-lowest px-5 py-3.5 font-label text-sm font-bold text-on-surface shadow-sm transition-colors hover:bg-surface-bright disabled:opacity-60"
            >
              <GoogleMark className="h-5 w-5 shrink-0" />
              <span>{googleLoading ? "Opening Google…" : "Google"}</span>
            </button>
            <button
              type="button"
              aria-disabled="true"
              className="group flex w-full min-h-[52px] items-center justify-center gap-3 rounded-full border border-outline-variant/15 bg-surface-container-lowest px-5 py-3.5 font-label text-sm font-bold text-on-surface/60 shadow-sm cursor-not-allowed"
            >
              <FacebookMark className="h-5 w-5 shrink-0 opacity-60" />
              <span>Facebook</span>
            </button>
          </div>

          <p className="mt-8 text-center text-on-surface-variant text-sm font-medium">
            Already have a sanctuary?{" "}
            <Link
              to="/login"
              className="text-primary font-bold underline underline-offset-4"
            >
              Log In
            </Link>
          </p>

          <div className="mt-12 flex justify-center gap-6 opacity-40">
            <span className="text-[10px] font-label uppercase tracking-[0.2em]">Privacy</span>
            <span className="text-[10px] font-label uppercase tracking-[0.2em]">Terms</span>
            <span className="text-[10px] font-label uppercase tracking-[0.2em]">Ethos</span>
          </div>
        </div>
      </section>

      <div className="fixed bottom-[-5%] right-[-10%] w-64 h-64 bg-tertiary-container/10 rounded-full blur-3xl z-10 pointer-events-none" />
      <div className="fixed top-[20%] left-[-10%] w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl z-10 pointer-events-none" />
    </div>
  );
};

export default SignupPage;
