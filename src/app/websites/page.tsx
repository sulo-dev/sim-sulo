"use client";

import Link from "next/link";

// Mock Data Semua Website
const allWebsites = [
  { id: 1, name: "Portal Desa Digital", client: "Pemerintah Desa", stack: "Next.js", status: "Active" },
  { id: 2, name: "Sikeris Management", client: "CV Afila Media Karya", stack: "React", status: "Warranty" },
  { id: 3, name: "SULO-MIS", client: "SULO.dev", stack: "Next.js", status: "Internal" },
  { id: 4, name: "SULO Landing Page", client: "SULO.dev", stack: "Astro", status: "Active" },
];

export default function AllWebsitesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Semua Website</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau seluruh proyek website lintas klien.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20">
          + Tambah Website
        </button>
      </div>

      <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 font-semibold">Nama Proyek</th>
                <th className="py-4 px-6 font-semibold">Pemilik / Klien</th>
                <th className="py-4 px-6 font-semibold">Tech Stack</th>
                <th className="py-4 px-6 font-semibold">Status Kontrak</th>
                <th className="py-4 px-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {allWebsites.map((web) => (
                <tr key={web.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                    <Link href={`/websites/${web.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                      {web.name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{web.client}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
                      {web.stack}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      web.status === 'Active' 
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                        : web.status === 'Warranty'
                        ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                        : 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                    }`}>
                      {web.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link 
                      href={`/websites/${web.id}`}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Buka Detail &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}