import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar Navigasi Utama */}
      <Sidebar />

      {/* Area Konten Utama Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* TOPBAR HEADER TERPADU SULO-MIS */}
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between z-10 shrink-0 transition-colors duration-300">
          {/* Sisi Kiri: Status Zona Waktu & Sistem */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-mono">
                SULO-MIS • WITA (Makassar)
              </span>
            </div>
          </div>

          {/* Sisi Kanan: Badge Profil Internal */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#011D58] to-[#022b82] text-white flex items-center justify-center font-black text-xs shadow-md border border-white/20">
                S
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                  Admin Internal
                </p>
                <p className="text-[10px] font-semibold text-[#FC7A0B] uppercase tracking-wider">
                  SULO.dev
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar transition-colors duration-300 bg-slate-50/50 dark:bg-slate-950/50">
          {/* AMBIENT BACKGROUND GLOW (SULO-MIS DNA) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#FC7A0B]/[0.04] dark:bg-[#FC7A0B]/[0.08] blur-[140px]" />
            <div className="absolute top-[40%] -left-[10%] w-[45%] h-[45%] rounded-full bg-[#011D58]/[0.04] dark:bg-[#011D58]/[0.10] blur-[140px]" />
          </div>

          {/* Wrapper Konten Utama dengan Padding Responsif */}
          <div className="min-h-full p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}