"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Project = {
  id: number;
  name: string;
  client: string;
  status: string;
  nextBilling: string;
};

type DashboardData = {
  activeClients: number;
  totalWebsites: number;
  activeWebsites: number;
  stagingWebsites: number;
  inactiveWebsites: number;
  mrr: number;
  profitMargin: number;
  criticalAssets: number;
  recentProjects: Project[];
  mrrTrendData: { name: string; current: number }[]; 
};

// Animasi Masuk (Staggered)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 25 } }
};

export default function DashboardClient({ data }: { data: DashboardData }) {
  // Fungsi pemformatan Rupiah
  const formatIDR = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  };

  // Setup Warna Pie Chart (Data di-passing langsung dari props Real DB)
  const websiteStatusData = [
    { name: 'Active', value: data.activeWebsites, color: '#10B981' }, // Hijau (Emerald)
    { name: 'Staging', value: data.stagingWebsites, color: '#F59E0B' }, // Kuning (Amber)
    { name: 'Inactive', value: data.inactiveWebsites, color: '#64748B' }, // Abu-abu (Slate)
  ];

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="space-y-8 max-w-7xl mx-auto relative pb-10"
    >
      {/* Header Sambutan */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FA4D09] to-[#FF9F03]">Operasional</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl">
            Pantau seluruh infrastruktur klien, domain, dan arus kas secara terpusat dalam waktu nyata (Real-Time).
          </p>
        </div>
        
        {/* Indikator Status Sistem */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Neon DB Terkoneksi
            </span>
          </div>
        </div>
      </motion.div>

      {/* ========================================= */}
      {/* 1. GRID STATISTIK KARTU (4 Kolom) */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Kartu: Total Klien Aktif */}
        <motion.div variants={itemVariants} className="relative p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#011D58]/10 group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#011D58]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#011D58] dark:group-hover:text-[#FF9F03] transition-colors">Total Klien Aktif</p>
            <div className="p-2.5 rounded-2xl bg-[#011D58]/5 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] group-hover:bg-[#011D58]/10 dark:group-hover:bg-[#FF9F03]/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          </div>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white relative z-10 tracking-tight">{data.activeClients}</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-2 relative z-10">Entitas perusahaan & perorangan</p>
        </motion.div>

        {/* Kartu: Website Terkelola */}
        <motion.div variants={itemVariants} className="relative p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#FC7A0B]/10 group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC7A0B]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#FC7A0B] transition-colors">Website Terkelola</p>
            <div className="p-2.5 rounded-2xl bg-[#FC7A0B]/10 text-[#FC7A0B] group-hover:bg-[#FC7A0B]/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </div>
          </div>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white relative z-10 tracking-tight">{data.totalWebsites}</h3>
          <div className="flex items-center gap-2 mt-2 relative z-10 text-[11px] font-bold">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{data.activeWebsites} Live</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{data.stagingWebsites} Staging</span>
          </div>
        </motion.div>

        {/* Kartu: MRR (Blue Gradient) */}
        <motion.div variants={itemVariants} className="relative p-6 rounded-3xl bg-gradient-to-br from-[#011D58] to-[#022b82] text-white border border-[#011D58]/50 shadow-xl shadow-[#011D58]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#011D58]/50 group overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
          
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">MRR Bulanan (Aktif)</p>
            <div className="p-2.5 rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mt-1 relative z-10 tracking-tight">{formatIDR(data.mrr)}</h3>
          <div className="flex items-center gap-2 mt-2.5 relative z-10">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black tracking-widest uppercase">MARGIN {data.profitMargin}%</span>
            <span className="text-[10px] text-slate-300 font-medium">Est. profit bersih</span>
          </div>
        </motion.div>

        {/* Kartu: Aset Kritis (Warning / Safe) */}
        <motion.div variants={itemVariants} className={`relative p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 group overflow-hidden ${
          data.criticalAssets > 0 
            ? 'bg-[#FA4D09]/5 dark:bg-[#FA4D09]/10 border-[#FA4D09]/30 shadow-[0_0_30px_rgba(250,77,9,0.15)]' 
            : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl'
        }`}>
          {data.criticalAssets > 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-[#FA4D09]/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none animate-pulse"></div>}
          
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className={`text-[11px] font-bold uppercase tracking-wider ${data.criticalAssets > 0 ? 'text-[#FA4D09]' : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors'}`}>
              Aset Kritis (H-14)
            </p>
            <div className={`p-2.5 rounded-2xl ${data.criticalAssets > 0 ? 'bg-[#FA4D09]/20 text-[#FA4D09] shadow-[0_0_15px_rgba(250,77,9,0.3)] animate-pulse' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors'}`}>
              {data.criticalAssets > 0 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
          </div>
          <h3 className={`text-4xl font-black relative z-10 tracking-tight ${data.criticalAssets > 0 ? 'text-[#FA4D09]' : 'text-slate-900 dark:text-white'}`}>
            {data.criticalAssets}
          </h3>
          <p className={`text-[11px] font-medium mt-2 relative z-10 ${data.criticalAssets > 0 ? 'text-[#FA4D09]/80' : 'text-slate-500'}`}>
            {data.criticalAssets > 0 ? "Domain/Hosting mendekati ED!" : "Semua infrastruktur aman"}
          </p>
        </motion.div>
      </div>

      {/* ========================================= */}
      {/* 2. GRAPHS SECTION (3 Kolom: 2 MRR, 1 Pie) */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Grafik MRR Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/30 dark:shadow-none flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trend Pendapatan (MRR)</h3>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Kalkulasi Otomatis via DB Finances</p>
            </div>
            <Link href="/finances" className="text-xs font-bold text-[#FC7A0B] hover:text-white transition-colors bg-[#FC7A0B]/10 hover:bg-[#FC7A0B] px-4 py-2 rounded-xl shadow-sm">
              Kelola Finansial
            </Link>
          </div>
          <div className="h-[260px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.mrrTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#011D58" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#011D58" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} tickFormatter={(val) => `Rp${(val/1000000)}Jt`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#FC7A0B', fontWeight: '900' }}
                  labelStyle={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}
                  formatter={(value) => formatIDR(typeof value === 'number' ? value : Number(value) || 0)}
                />
                <Area type="monotone" dataKey="current" name="Total Revenue" stroke="#011D58" strokeWidth={4} fillOpacity={1} fill="url(#colorCurrent)" activeDot={{ r: 6, fill: '#FC7A0B', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Grafik Pie Status Website */}
        <motion.div variants={itemVariants} className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/30 dark:shadow-none flex flex-col">
          <div className="mb-2 text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Distribusi Website</h3>
            <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Berdasarkan Status Live DB</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie 
                  data={websiteStatusData} 
                  cx="50%" cy="50%" 
                  innerRadius={65} outerRadius={85} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none"
                  cornerRadius={4}
                >
                  {websiteStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Teks di tengah Donut Chart */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{data.totalWebsites}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total DB</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto border-t border-slate-100 dark:border-slate-800/80 pt-4">
            {websiteStatusData.map((stat) => (
              <div key={stat.name} className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.color }}></span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">{stat.name}</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ========================================= */}
      {/* 3. TABEL PROYEK TERBARU & STATUS SERVER */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Tabel Utama Dinamis dari DB */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/30 dark:shadow-none overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pantauan Proyek Terbaru</h3>
            <Link href="/websites" className="text-xs font-bold text-[#FC7A0B] hover:text-[#FA4D09] transition-colors flex items-center gap-1">
              Buka Master Data <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar -mx-6 px-6 pb-2">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Nama Proyek & Klien</th>
                  <th className="pb-3 px-4 text-center">Status Tagihan</th>
                  <th className="pb-3 pl-4 text-right">Tgl. Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 pr-4">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors">{project.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{project.client}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border inline-flex ${
                        project.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                        project.status === 'Unpaid' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                        'bg-[#011D58]/5 text-[#011D58] border-[#011D58]/20 dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] dark:border-[#FF9F03]/20'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{project.nextBilling}</p>
                    </td>
                  </tr>
                ))}
                {data.recentProjects.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Database Proyek Kosong</p>
                      <p className="text-xs text-slate-500 mt-1">Belum ada entitas website yang diinput.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Panel Aktivitas & Status Server */}
        <motion.div variants={itemVariants} className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/30 dark:shadow-none flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Status Node SULO</h3>
            <div className="space-y-5">
              
              <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="p-2.5 rounded-xl bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Koneksi Neon DB Aktif</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Latensi baca/tulis normal: 12ms</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Akses Kredensial Aman</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Semua jalur data tersandikan (Encrypted)</p>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-4 rounded-2xl bg-[#011D58] border border-[#011D58]/50 text-white flex items-center justify-between shadow-xl shadow-[#011D58]/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <span className="flex items-center gap-2.5 relative z-10 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                Sesi Akses Admin
              </span>
              <span className="text-[#FF9F03] font-mono font-bold text-xs relative z-10 bg-[#FF9F03]/10 px-2 py-1 rounded">Batas: 45m</span>
            </div>
          </div>

        </motion.div>
      </div>

    </motion.div>
  );
}