import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle, MailOpen } from "lucide-react";
import { motion } from "motion/react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerificationNeeded(false);
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin" : "/my-complaints");
    } catch (err: any) {
      if (err.response?.data?.emailVerified === false) {
        setVerificationNeeded(true);
        setError(
          err.response?.data?.message || "Please verify your email first.",
        );
      } else {
        setError(err.response?.data?.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage("");
    try {
      const res = await axios.post("/api/auth/resend-verification", { email });
      setResendMessage(
        res.data.demoVerificationLink
          ? `Verification link: ${res.data.demoVerificationLink}`
          : res.data.message,
      );
    } catch (err: any) {
      setResendMessage(
        err.response?.data?.message || "Failed to resend verification",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-xl border border-slate-100 mb-8 overflow-hidden group">
            <img
              src="/LOGO.png"
              alt="NLC Logo"
              className="h-40 w-40 object-contain group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Login to manage your complaints</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {verificationNeeded && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
              <MailOpen className="h-5 w-5" />
              Email Verification Required
            </div>
            <p className="text-sm text-amber-600 mb-3">
              Please verify your email address before logging in.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
            {resendMessage && (
              <div className="mt-3 p-2 bg-white rounded border border-amber-200 text-xs break-all">
                {resendMessage}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              "Logging in..."
            ) : (
              <>
                Login <LogIn className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-600 font-bold hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
