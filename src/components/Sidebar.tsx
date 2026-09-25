"use client";

import Link from "next/link";
import Image from "next/image";
import LogoSulo from "../../public/sulodev.png";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Kumpulan Menu beserta Ikon SVG Vektor Kustom (Menggantikan Emoji)
  const menuItems = [
    { 
      name: "Dashboard", 
      href: "/dashboard",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    },
    { 
      name: "Klien", 
      href: "/clients",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    { 
      name: "Semua Website", 
      href: "/websites",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
    },
    { 
      name: "Infrastruktur", 
      href: "/infrastructure",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
    },
    { 
      name: "Tiket & Masalah", 
      href: "/tickets",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
    },
    { 
      name: "Keuangan", 
      href: "/finance",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    },
    { 
      name: "Audit Trail", 
      href: "/audit",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    },
    { 
      name: "Tim & HRIS", 
      href: "/users",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    },
  ];

  return (
    <aside className="w-[260px] border-r border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl hidden md:flex flex-col transition-colors shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none z-40">
      
      {/* Header Sidebar dengan Logo SULO & Toggle Theme */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-3.5">
          {/* Logo Rounded SULO */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700 shadow-sm shrink-0 bg-gradient-to-br from-[#011D58]/5 to-transparent dark:from-slate-800 flex items-center justify-center group">
            <Image
              src={LogoSulo}
              alt="Logo SULO"
              width={44}
              height={44}
              className="object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
              priority // <--- INI SANGAT PENTING
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-black tracking-tight text-[#011D58] dark:text-white leading-none">
              SULO<span className="text-[#FA4D09]">MIS</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Internal Portal
            </p>
          </div>
        </div>

        {/* Tombol Toggle Tema */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#FA4D09] dark:hover:text-[#FF9F03] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shrink-0 border border-slate-200/50 dark:border-slate-700"
            title="Ganti Tema (Dark/Light)"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        )}
      </div>

      {/* Navigasi Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Menu Navigasi</p>
        
        {menuItems.map((item) => {
          // Logika Active: Harus exact match untuk "/", sisanya pakai startsWith
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? "bg-[#011D58] dark:bg-[#FF9F03]/10 text-white dark:text-[#FF9F03] shadow-md shadow-[#011D58]/20 dark:shadow-none"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {/* Indikator Garis Kiri saat Aktif (Light Mode) */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FC7A0B] rounded-r-full"></div>
              )}
              
              <div className={`${
                isActive 
                  ? "text-[#FC7A0B] dark:text-[#FF9F03]" 
                  : "text-slate-400 group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03]"
                } transition-colors duration-300`}
              >
                {item.icon}
              </div>
              
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Footer Sidebar (Logout) */}
        <div className="mt-auto pt-6">
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <LogoutButton />
          </div>
        </div>
      </nav>
    </aside>
  );
}