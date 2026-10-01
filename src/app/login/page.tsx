"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Email atau password yang Anda masukkan salah.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-4 sm:px-6">
      {/* Visual Background Glow & Grid Pattern with Smooth Masking */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#011D58]/15 via-[#FC7A0B]/10 to-[#FA4D09]/15 dark:from-[#011D58]/35 dark:via-[#FC7A0B]/20 dark:to-[#FA4D09]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 sm:p-10 relative z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-slate-950/80"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
            className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-[#FF9F03] dark:to-[#FA4D09] rounded-2xl flex items-center justify-center shadow-xl shadow-[#011D58]/25 dark:shadow-[#FF9F03]/20 text-white dark:text-slate-950 border border-white/20 relative"
          >
            {/* Inner Glow Detail */}
            <div className="absolute inset-0 rounded-2xl border border-white/10 mix-blend-overlay"></div>
            <svg
              className="w-8 h-8 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#FC7A0B]/10 text-[#FC7A0B] border border-[#FC7A0B]/20 mb-4 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FC7A0B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FC7A0B]"></span>
            </span>
            Restricted Access
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#011D58] dark:text-white tracking-tight leading-none">
            SULO<span className="text-[#FA4D09] dark:text-[#FF9F03]">-MIS</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
            Portal Manajemen Internal SULO.dev
          </p>
        </div>

        {/* Error Notification Alert with Shake Animation */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, x: 0 }}
              animate={{ opacity: 1, y: 0, x: [-5, 5, -5, 5, 0] }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-3 shadow-sm"
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Akses */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div className="group">
            <label
              htmlFor="email"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 transition-colors group-focus-within:text-[#FC7A0B]"
            >
              Email Akses
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 transition-colors group-focus-within:text-[#FC7A0B]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-[#FC7A0B]/50 focus:border-[#FC7A0B] transition-all outline-none shadow-sm"
                placeholder="admin@sulo.dev"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 transition-colors group-focus-within:text-[#FC7A0B]"
            >
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 transition-colors group-focus-within:text-[#FC7A0B]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-11 pr-11 py-3.5 focus:ring-2 focus:ring-[#FC7A0B]/50 focus:border-[#FC7A0B] transition-all outline-none shadow-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-[#FC7A0B] dark:hover:text-[#FF9F03] transition-colors cursor-pointer"
                title={showPassword ? "Sembunyikan Sandi" : "Tampilkan Sandi"}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.02 10.02 0 012.122-.138c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#011D58] hover:bg-[#011D58]/90 dark:bg-gradient-to-r dark:from-[#FF9F03] dark:to-[#FA4D09] dark:hover:opacity-95 rounded-xl shadow-lg shadow-[#011D58]/20 dark:shadow-[#FA4D09]/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Mengautentikasi...</span>
              </>
            ) : (
              "Masuk ke Sistem"
            )}
          </button>
        </form>

        {/* Footer Info & Security Badges */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            SULO Security Systems &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[9px] font-semibold tracking-wide">256-bit Encrypted Connection</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}