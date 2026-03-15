"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/chatApi";

interface AuthGateProps {
  onAuthenticated: () => void;
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let ok: boolean;
      if (mode === "signup") {
        ok = await signUp(email, password, fullName);
      } else {
        ok = await signIn(email, password);
      }
      if (ok) {
        onAuthenticated();
      } else {
        setError(
          mode === "signin"
            ? "Invalid email or password"
            : "Could not create account. Email may already be in use."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-charcoal flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-light">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h1 className="text-xl font-display font-semibold text-charcoal">
            Prelegal AI
          </h1>
          <p className="text-sm text-warm-gray mt-1">
            Sign in to start drafting your NDA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-4 shadow-sm">
          {mode === "signup" && (
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-warm-gray mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-cream px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-charcoal-30 focus:ring-1 focus:ring-charcoal-10"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-warm-gray mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-cream px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-charcoal-30 focus:ring-1 focus:ring-charcoal-10"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-warm-gray mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-cream px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-charcoal-30 focus:ring-1 focus:ring-charcoal-10"
            />
          </div>

          {error && (
            <p className="text-sm text-error bg-error-light px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-purple hover:bg-purple-hover rounded-lg transition-all disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>

          <p className="text-center text-xs text-warm-gray">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="text-charcoal font-medium hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(""); }}
                  className="text-charcoal font-medium hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
