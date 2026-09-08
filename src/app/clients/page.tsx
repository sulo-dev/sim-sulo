"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { mockClients } from "@/lib/mockData";
import AddClientModal from "@/components/AddClientModal";

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Klien & Website</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola data klien dan aset digital mereka.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Klien
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            {/* Kartu sekarang dibungkus Link untuk menuju ke halaman detail */}
            <Link href={`/clients/${client.id}`}>
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-indigo-300 dark:hover:border-slate-700 transition-colors group cursor-pointer h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{client.companyName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{client.picName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs border ${
                    client.status === 'Active' 
                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                    : 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                  }`}>
                    {client.status}
                  </span>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {client.email}
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <p className="text-xs text-slate-500 mb-2">Website Terkait:</p>
                    <div className="flex flex-wrap gap-2">
                      {client.websites.map((web, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800/80 text-indigo-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">
                          {web}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && <AddClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}