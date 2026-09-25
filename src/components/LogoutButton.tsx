"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Menggunakan callbackUrl untuk mengarahkan ke halaman login setelah sesi dihapus
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="group flex items-center justify-between w-full p-2 pr-4 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-sm transition-all border border-slate-200/80 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-500/30 shadow-sm hover:shadow-md disabled:opacity-70"
    >
      <div className="flex items-center gap-3">
        {/* Kotak Ikon */}
        <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
          {isLoggingOut ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
        </span>
        <span>{isLoggingOut ? "Keluar..." : "Keluar Sesi"}</span>
      </div>
      
      {/* Aksen panah kecil di ujung kanan yang muncul saat di-hover */}
      {!isLoggingOut && (
        <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}