"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Tutup mobile drawer saat navigasi berubah
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Kelompok Menu Terstruktur ERP Enterprise SULO-MIS
  const menuSections: MenuSection[] = [
    {
      title: "Utama",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Proyek & Operasional",
      items: [
        {
          name: "Klien",
          href: "/clients",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          ),
        },
        {
          name: "Semua Proyek",
          href: "/websites",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          ),
        },
        {
          name: "Papan Sprint",
          href: "/tickets",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          ),
        },
        {
          name: "Infrastruktur",
          href: "/infrastructure",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Keuangan & Aset",
      items: [
        {
          name: "Keuangan",
          href: "/finance",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          ),
        },
        {
          name: "Honor & Payroll",
          href: "/payroll",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        },
        {
          name: "Aset Inventaris",
          href: "/assets",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Administrasi & SDM",
      items: [
        {
          name: "Arsip Sentral",
          href: "/archives",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          ),
        },
        {
          name: "Tim & HRIS",
          href: "/users",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ),
        },
        {
          name: "Audit Trail",
          href: "/audit",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          ),
        },
      ],
    },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Header Sidebar dengan Logo SULO & Toggle Theme */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo SULO dengan Ring Gradient */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden p-[1.5px] bg-gradient-to-tr from-[#011D58] via-[#FC7A0B] to-[#FF9F03] shadow-md shadow-[#011D58]/10 shrink-0 group">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] overflow-hidden flex items-center justify-center">
              <img
                src="/sulodev.png"
                alt="Logo SULO"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-black tracking-tight text-[#011D58] dark:text-white leading-none">
              SULO<span className="text-[#FA4D09] dark:text-[#FF9F03]">MIS</span>
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Internal ERP
            </p>
          </div>
        </div>

        {/* Tombol Toggle Tema (Dark/Light) */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#FA4D09] dark:hover:text-[#FF9F03] hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all shrink-0 border border-slate-200/50 dark:border-slate-700/60 cursor-pointer"
            title="Ganti Tema Mode"
          >
            {theme === "dark" ? (
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Navigasi Menu Terkelompok */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto custom-scrollbar space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Judul Kategori Section */}
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400/90 dark:text-slate-500 mb-2">
              {section.title}
            </p>

            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? "bg-[#011D58] dark:bg-[#FF9F03]/15 text-white dark:text-[#FF9F03] shadow-md shadow-[#011D58]/15 dark:shadow-none"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {/* Indicator Line Kiri Saat Aktif */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FC7A0B] rounded-r-full shadow-sm" />
                  )}

                  {/* Icon Menu */}
                  <div
                    className={`${
                      isActive
                        ? "text-[#FC7A0B] dark:text-[#FF9F03]"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03]"
                    } transition-colors duration-200 shrink-0`}
                  >
                    {item.icon}
                  </div>

                  {/* Label Nama Menu */}
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200 truncate">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Footer System Badging & Logout */}
        <div className="pt-4 pb-2">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1">
              <span>SYSTEM ENGINE</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700/60 rounded text-slate-600 dark:text-slate-300">
                v2.4 Pro
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed bottom-5 right-5 z-[100] p-3.5 bg-[#011D58] dark:bg-[#FF9F03] text-white dark:text-slate-950 rounded-full shadow-2xl border border-white/20 active:scale-90 transition-transform cursor-pointer"
        aria-label="Toggle Navigation Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Drawer Backdrop & Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />
          <aside className="relative w-[280px] max-w-[80vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar Fixed */}
      <aside className="w-[265px] border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl hidden md:flex flex-col transition-colors shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none z-40">
        {SidebarContent}
      </aside>
    </>
  );
}