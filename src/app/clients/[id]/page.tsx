"use client";

import Link from "next/link";
import { mockClients } from "@/lib/mockData";
import { useParams } from "next/navigation";

export default function ClientDetailPage() {
  const params = useParams();
  // Cari data klien berdasarkan ID dari URL
  const client = mockClients.find((c) => c.id.toString() === params.id);

  if (!client) {
    return <div className="text-center mt-20 text-slate-500">Klien tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
        <Link href="/clients" className="hover:text-indigo-500 transition-colors">Klien</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-200 font-medium">{client.companyName}</span>
      </div>

      {/* Profil Klien */}
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{client.companyName}</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">PIC: {client.picName} • {client.email}</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {client.status}
          </span>
        </div>
      </div>

      {/* Daftar Website Klien */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 mt-8">Proyek Website</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {client.websites.map((web, idx) => (
             // Asumsi: Kita lempar ke /websites/1 untuk sementara karena mockData terbatas
            <Link key={idx} href={`/websites/1`}>
              <div className="p-5 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-slate-700 transition-colors cursor-pointer group flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{web}</h4>
                  <p className="text-xs text-slate-500 mt-1">Klik untuk melihat detail infrastruktur & tiket</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}