"use client";

import { allInfrastructures } from "@/lib/mockData";

export default function InfrastructurePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Infrastruktur & Aset</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau jadwal perpanjangan (renewal) domain, hosting, dan server semua klien.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allInfrastructures.map((infra) => (
          <div key={infra.id} className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md">{infra.type}</span>
                <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${infra.status === 'Safe' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'}`}>
                  {infra.status === 'Warning' ? 'Segera Expired' : 'Aman'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{infra.asset}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{infra.provider}</p>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-slate-500 dark:text-slate-400">Proyek:</span>
                <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{infra.website}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Kedaluwarsa:</span>
                <span className={`font-bold ${infra.status === 'Warning' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>{infra.expiry}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}