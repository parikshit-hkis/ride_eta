"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Car, Lock, User, Mail, ShieldCheck, ArrowRight, AlertCircle, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        await register(username, email, password);
      } else {
        await login(username, password);
      }
      router.push("/predictions");
    } catch (err) {
      setError(err.message || (isRegistering ? "Registration failed" : "Invalid username or password"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u, p) => {
    setIsRegistering(false);
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "var(--bg-main)" }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            style={{
              background: "rgba(79, 70, 229, 0.12)",
              border: "1px solid rgba(79, 70, 229, 0.30)",
              color: "var(--accent-indigo)",
            }}
            className="inline-flex p-3 rounded-2xl mb-3"
          >
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Ride ETA Platform
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {isRegistering
              ? "Create a Data Scientist Account"
              : "Sign in with Role-Based Access Control (RBAC)"}
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="enterprise-card p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 badge-danger rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Username</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-primary text-sm flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <span>
                {loading
                  ? isRegistering
                    ? "Registering..."
                    : "Signing in..."
                  : isRegistering
                  ? "Create Account"
                  : "Sign In"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Register / Sign In Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              style={{ color: "var(--accent-indigo)" }}
              className="text-xs font-semibold transition-colors inline-flex items-center space-x-1 hover:opacity-80"
            >
              {isRegistering ? (
                <>
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  <span>Already have an account? Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  <span>Don't have an account? Register as Data Scientist</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Fill Demo Accounts */}
          <div className="pt-4" style={{ borderTop: "1px solid var(--border-main)" }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider block mb-2 text-center" style={{ color: "var(--text-secondary)" }}>
              Quick Fill Demo Accounts
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin", "admin123")}
                className="p-2 btn-secondary rounded-xl text-[11px] font-semibold text-center transition-colors hover:border-[var(--accent-indigo)]"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo("ds", "ds123")}
                className="p-2 btn-secondary rounded-xl text-[11px] font-semibold text-center transition-colors hover:border-[var(--accent-indigo)]"
              >
                Data Sci Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
