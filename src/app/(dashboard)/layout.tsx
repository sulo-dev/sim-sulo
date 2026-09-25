// src/app/(dashboard)/layout.tsx
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Sidebar HANYA muncul di dalam grup dashboard ini */}
      <Sidebar />

      {/* Area Konten Utama */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar transition-colors duration-300 bg-slate-50/50 dark:bg-slate-950/50">
        
        {/* AMBIENT BACKGROUND GLOW (Global SULO DNA) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#FC7A0B]/[0.03] dark:bg-[#FC7A0B]/[0.08] blur-[120px]"></div>
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#011D58]/[0.03] dark:bg-[#011D58]/[0.08] blur-[120px]"></div>
        </div>

        {/* Wrapper Konten dengan Padding Responsif */}
        <div className="min-h-full p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </div>

      </main>
    </div>
  );
}