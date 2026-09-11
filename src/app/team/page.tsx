"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddTeamModal from "@/components/AddTeamModal";

// Mock Data HRIS / Team
const allTeamMembers = [
  { id: "HR-001", name: "Andi Saputra", role: "Frontend Developer", email: "andi@sulo.dev", phone: "081234567890", status: "Active", joined: "15 Jan 2026" },
  { id: "HR-002", name: "Budi Santoso", role: "Backend Developer", email: "budi@sulo.dev", phone: "082345678901", status: "Active", joined: "01 Feb 2026" },
  { id: "HR-003", name: "Citra Lestari", role: "UI/UX Designer", email: "citra@sulo.dev", phone: "083456789012", status: "On Leave", joined: "10 Mar 2026" },
  { id: "HR-004", name: "Dewi Kirana", role: "Project Manager", email: "dewi@sulo.dev", phone: "084567890123", status: "Active", joined: "05 Apr 2026" },
  { id: "HR-005", name: "Eko Pratama", role: "Marketing", email: "eko@sulo.dev", phone: "085678901234", status: "Inactive", joined: "20 Mei 2026" },
];

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Kalkulasi Ringkasan
  const totalMembers = allTeamMembers.length;
  const activeMembers = allTeamMembers.filter(m => m.status === "Active").length;
  const onLeaveMembers = allTeamMembers.filter(m => m.status === "On Leave").length;

  // Logika Pencarian dan Filter
  const filteredMembers = allTeamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tim & <span className="text-[#FA4D09]">HRIS</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manajemen data anggota, peran, dan status karyawan internal.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Tambah Anggota Baru
        </button>
      </div>

      {/* Mini Stats & Toolbar Pencarian */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        {/* Ringkasan */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Anggota</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{totalMembers} Orang</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Aktif Bekerja</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{activeMembers} Orang</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#FF9F03]/10 text-[#FC7A0B] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cuti / Izin</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{onLeaveMembers} Orang</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari nama, role, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] outline-none transition-colors"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Aktif</option>
            <option value="On Leave">Cuti/Izin</option>
            <option value="Inactive">Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Tim */}
      <div className="rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 font-semibold">Nama & ID</th>
                <th className="py-4 px-6 font-semibold">Posisi / Role</th>
                <th className="py-4 px-6 font-semibold">Kontak</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 relative">
              <AnimatePresence>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <motion.tr 
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-[11px] font-mono font-medium text-slate-400 mt-0.5">{member.id}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-[#011D58]/5 dark:bg-[#011D58]/40 border border-[#011D58]/10 dark:border-[#011D58]/20 text-[#011D58] dark:text-[#FF9F03]">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{member.email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{member.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border flex items-center w-fit gap-1.5 ${
                          member.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                          member.status === 'On Leave' ? 'bg-[#FF9F03]/10 text-[#FC7A0B] border-[#FF9F03]/20' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {member.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                          {member.status === 'On Leave' && <span className="w-1.5 h-1.5 rounded-full bg-[#FC7A0B]"></span>}
                          {member.status === 'Inactive' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}
                          {member.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      Anggota tim tidak ditemukan.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER MODAL TAMBAH ANGGOTA TIM */}
      <AnimatePresence>
        {isModalOpen && (
          <AddTeamModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}