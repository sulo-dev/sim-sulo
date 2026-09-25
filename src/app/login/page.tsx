"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Email atau password salah.");
      setIsLoading(false);
    } else {
      router.push("/dashboard"); // Arahkan ke Dashboard jika sukses
      router.refresh();
    }
  };

  return (
    // Hapus class 'dark', gunakan bg-slate-50 untuk terang & dark:bg-slate-950 untuk gelap
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden">
      
      {/* Background Glow Effect - Biru (Terang) & Oranye (Gelap) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#011D58]/10 dark:bg-[#FA4D09]/10 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 sm:p-10 relative z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-[#011D58] dark:text-white mb-2 tracking-tight">
            SULO<span className="text-[#FA4D09]">-MIS</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Portal Manajemen Internal SULO.dev</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-[#FA4D09]/10 border border-rose-200 dark:border-[#FA4D09]/20 text-rose-600 dark:text-[#FA4D09] text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Email Akses</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3.5 transition-all outline-none shadow-sm dark:shadow-none" 
              placeholder="admin@sulo.dev" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Kata Sandi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3.5 transition-all outline-none shadow-sm dark:shadow-none" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-5 py-3.5 text-sm font-bold text-white bg-[#011D58] hover:bg-[#011D58]/90 rounded-xl shadow-lg shadow-[#011D58]/20 transition-all flex justify-center mt-4 disabled:opacity-50"
          >
            {isLoading ? "Mengautentikasi..." : "Masuk ke Sistem"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}