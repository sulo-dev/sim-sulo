"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const menuItems = [
    { name: "📊 Dashboard", href: "/" },
    { name: "🏢 Klien", href: "/clients" },
    { name: "🌐 Semua Website", href: "/websites" },
    { name: "🔧 Infrastruktur", href: "/infrastructure" },
    { name: "🎫 Tiket & Masalah", href: "/tickets" },
    { name: "💳 Keuangan", href: "/finance" },
    { name: "🛡️ Audit Trail", href: "/audit" },
    { name: "👥 Tim & HRIS", href: "/team" },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hidden md:flex flex-col transition-colors">
      {/* Header Sidebar dengan Logo SULO & Toggle Theme */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Logo Rounded SULO dari folder public */}
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm shrink-0 bg-[#011D58]/5 dark:bg-slate-800 flex items-center justify-center">
            <img
              src="/SuloDev.png"
              alt="Logo SULO"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#011D58] dark:text-white leading-none">
              SULO<span className="text-[#FA4D09]">-MIS</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              Internal Portal
            </p>
          </div>
        </div>

        {/* Tombol Toggle Tema */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            title="Ganti Tema"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        )}
      </div>

      {/* Navigasi Menu */}
      <nav className="flex-1 p-4 space-y-1.5 flex flex-col">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-[#011D58]/10 dark:bg-[#011D58]/40 text-[#011D58] dark:text-[#FF9F03] font-bold border-r-4 border-[#FC7A0B] shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
              }`}
            >
              {item.name}
            </Link>
          );
        })}

        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}
