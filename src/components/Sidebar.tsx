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
    { name: "🌐 Website", href: "/websites" }, // <-- Menu Baru
    { name: "🔧 Infrastruktur", href: "/infrastructure" },
    { name: "🎫 Tiket & Masalah", href: "/tickets" },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl hidden md:flex flex-col transition-colors">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            SULO-MIS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Internal Portal</p>
        </div>
        
        {/* Tombol Toggle Tema */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 flex flex-col">
        {menuItems.map((item) => {
          // Logika Active State
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? "bg-indigo-500/10 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
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