"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard";
import InfrastructureModal from "@/components/InfrastructureModal";
import { mockWebsite } from "@/lib/mockData";

export default function WebsiteDetailPage() {
  const [activeTab, setActiveTab] = useState("infrastructure");
  // State untuk menyimpan data infrastruktur yang diklik
  const [selectedInfra, setSelectedInfra] = useState<any | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <Link href="/clients" className="hover:text-indigo-400 transition-colors">Klien</Link>
          <span>/</span>
          <span className="text-slate-200">{mockWebsite.clientName}</span>
          <span>/</span>
          <span className="text-indigo-400 font-medium">{mockWebsite.name}</span>
        </div>
        
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{mockWebsite.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <a href={mockWebsite.productionUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Production
              </a>
              <span className="text-slate-600">|</span>
              <span className="text-sm text-slate-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Go-Live: {mockWebsite.goLiveDate}
              </span>
            </div>
            
            <div className="flex gap-2 mt-4">
              {mockWebsite.techStack.map(tech => (
                <span key={tech} className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700/50">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {mockWebsite.status}
            </span>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-all border border-slate-700">
              Edit Project
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 max-w-md">
        {['infrastructure', 'credentials', 'tickets'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
              activeTab === tab 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab === 'infrastructure' ? 'Infrastruktur' : tab === 'credentials' ? 'Kredensial' : 'Tiket'}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'infrastructure' && (
            <motion.div
              key="infrastructure"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {mockWebsite.infrastructures.map((infra) => (
                <div 
                  key={infra.id} 
                  onClick={() => setSelectedInfra(infra)} // <-- Buka modal saat kartu diklik
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group" // <-- Tambah cursor-pointer
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{infra.type}</span>
                    <span className={`text-xs px-2 py-1 rounded ${infra.status === 'Safe' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                      {infra.status === 'Warning' ? 'Segera Expired' : 'Aman'}
                    </span>
                  </div>
                  {/* Efek hover teks memudar sedikit (opsional) */}
                  <h4 className="text-lg font-medium text-white group-hover:text-indigo-300 transition-colors">{infra.asset}</h4>
                  <p className="text-sm text-slate-400">{infra.provider}</p>
                  <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between text-sm">
                    <span className="text-slate-500">Berakhir pada:</span>
                    <span className={infra.status === 'Warning' ? 'text-amber-400 font-medium' : 'text-slate-300'}>{infra.expiry}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'credentials' && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {mockWebsite.credentials.map((cred) => (
                <div key={cred.id} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
                  <h4 className="text-md font-medium text-white mb-1">{cred.category} Access</h4>
                  <a href={cred.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline mb-4 inline-block">{cred.url}</a>
                  
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex justify-between items-center">
                      <span className="text-xs text-slate-500">Username</span>
                      <span className="text-sm text-slate-200 font-mono">{cred.username}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex justify-between items-center group">
                      <span className="text-xs text-slate-500">Password</span>
                      <button className="text-xs text-indigo-400 hover:text-indigo-300">Tampilkan / Salin</button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <KanbanBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Render Modal Infrastruktur di Sini */}
      <AnimatePresence>
        {selectedInfra && (
          <InfrastructureModal 
            isOpen={!!selectedInfra} 
            onClose={() => setSelectedInfra(null)} 
            data={selectedInfra} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}