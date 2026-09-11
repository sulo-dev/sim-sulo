"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center justify-center w-full gap-2.5 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:text-[#FA4D09] dark:hover:text-[#FA4D09] bg-slate-100/50 dark:bg-slate-900/40 hover:bg-[#FA4D09]/10 dark:hover:bg-[#FA4D09]/10 font-bold text-sm transition-all border border-slate-200/60 dark:border-slate-800 hover:border-[#FA4D09]/30 mt-auto shadow-sm"
    >
      <svg className="w-4 h-4 text-[#FA4D09]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      Keluar Sesi
    </button>
  );
}