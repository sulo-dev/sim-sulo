"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl overflow-hidden selection:bg-transparent">
      
      {/* Ambient Glow Orbs di Belakang Spinner */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-[#011D58]/10 to-[#FC7A0B]/10 dark:from-[#011D58]/20 dark:to-[#FA4D09]/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Loader Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center w-28 h-28"
      >
        {/* Lingkaran Luar (Berputar Searah Jarum Jam) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[3px] border-slate-200/30 dark:border-slate-800/50 border-t-[#011D58] border-r-[#FC7A0B] dark:border-t-[#FF9F03] dark:border-r-[#FC7A0B] shadow-[0_0_15px_rgba(252,122,11,0.15)] dark:shadow-[0_0_20px_rgba(255,159,3,0.15)]"
        />

        {/* Lingkaran Dalam (Berputar Berlawanan Arah) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          className="absolute inset-3 rounded-full border-[3px] border-slate-200/30 dark:border-slate-800/50 border-b-[#FC7A0B] border-l-[#011D58] dark:border-b-[#FA4D09] dark:border-l-[#011D58] opacity-80"
        />

        {/* Logo / Teks Tengah (Glow & Pulse) */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-900 w-16 h-16 rounded-full shadow-inner border border-slate-100 dark:border-slate-800"
        >
          <span className="text-[#011D58] dark:text-white font-black text-sm tracking-tighter leading-none">
            SULO
          </span>
          <span className="text-[8px] font-bold text-[#FC7A0B] tracking-widest mt-0.5">
            MIS
          </span>
        </motion.div>
      </motion.div>

      {/* Teks Animasi Loading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-8 flex flex-col items-center gap-3 relative z-10"
      >
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 tracking-[0.2em] uppercase">
            Memuat Sistem
          </p>
          {/* Animated Dots */}
          <div className="flex items-center gap-0.5 pb-1">
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }}
              className="w-1 h-1 bg-[#FC7A0B] rounded-full block"
            />
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }}
              className="w-1 h-1 bg-[#FC7A0B] rounded-full block"
            />
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }}
              className="w-1 h-1 bg-[#FC7A0B] rounded-full block"
            />
          </div>
        </div>

        {/* Info Engine Sistem */}
        <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          SULO Security Connected
        </p>
      </motion.div>

    </div>
  );
}