"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteCredential, createCredential } from "@/actions/credentialActions";

export type VaultCredential = {
  id: number;
  websiteId: number;
  websiteName: string;
  clientName: string;
  title: string;
  category: string;
  accessUrl: string;
  username: string;
  password: string;
  port: string;
  notes: string;
};

type Props = {
  initialCredentials: VaultCredential[];
  websites: { id: number; name: string; clientName: string }[];
};

export default function VaultClient({ initialCredentials, websites }: Props) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [websiteFilter, setWebsiteFilter] = useState("All");

  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCred, setNewCred] = useState({
    websiteId: websites[0]?.id || 0,
    category: "cPanel",
    username: "",
    password: "",
    accessUrl: "",
    title: "",
    notes: ""
  });

  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 4000);
  };

  const togglePassword = (id: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    triggerNotification(`${label} berhasil disalin!`);
  };

  const handleDelete = async (id: number, websiteId: number) => {
    if (!confirm("Hapus akses kredensial ini?")) return;
    const res = await deleteCredential(id, websiteId);
    if (res.success) {
      triggerNotification(res.message);
      router.refresh();
    } else {
      alert(res.message);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCred.websiteId || !newCred.username) {
      alert("Pilih proyek dan isi username!");
      return;
    }

    setIsSubmitting(true);
    const res = await createCredential(newCred.websiteId, {
      category: newCred.category,
      username: newCred.username,
      password: newCred.password,
      accessUrl: newCred.accessUrl,
      title: newCred.title,
      notes: newCred.notes
    });

    if (res.success) {
      triggerNotification("Kredensial baru berhasil ditambahkan!");
      setIsAddModalOpen(false);
      setNewCred({ websiteId: websites[0]?.id || 0, category: "cPanel", username: "", password: "", accessUrl: "", title: "", notes: "" });
      router.refresh();
    } else {
      alert(res.message);
    }
    setIsSubmitting(false);
  };

  const filteredData = initialCredentials.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.websiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.accessUrl.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesWebsite = websiteFilter === "All" || item.websiteId.toString() === websiteFilter;

    return matchesSearch && matchesCategory && matchesWebsite;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-12">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl backdrop-blur-xl border border-emerald-400/30"
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pusat Vault <span className="text-[#FA4D09]">Kredensial</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Penyimpanan aman terpusat untuk cPanel, Database, VPS, dan repositori seluruh proyek.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Tambah Akses Baru
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-full overflow-hidden focus-within:ring-2 focus-within:ring-[#FC7A0B]/50">
          <div className="relative w-full sm:w-72 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Cari kredensial, username, URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-slate-200 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-transparent text-slate-700 dark:text-slate-300 text-sm outline-none cursor-pointer font-medium appearance-none border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800"
          >
            <option value="All">Semua Kategori</option>
            <option value="cPanel">cPanel / Hosting</option>
            <option value="Database">Database</option>
            <option value="VPS">VPS / SSH</option>
            <option value="GitHub">GitHub / GitLab</option>
            <option value="Admin Panel">Admin Panel</option>
          </select>

          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="w-full sm:w-56 px-4 py-3 bg-transparent text-slate-700 dark:text-slate-300 text-sm outline-none cursor-pointer font-medium appearance-none"
          >
            <option value="All">Semua Proyek Website</option>
            {websites.map((web) => (
              <option key={web.id} value={web.id.toString()}>{web.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Cards Vault */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const isShowPass = !!visiblePasswords[item.id];

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#011D58] via-[#FC7A0B] to-[#022b82]"></div>

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200 dark:border-slate-700 inline-block mb-1.5">
                        {item.category}
                      </span>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors leading-tight">
                        {item.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, item.websiteId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Hapus Kredensial"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  {/* Relasi Proyek */}
                  <Link
                    href={`/websites/${item.websiteId}`}
                    className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 hover:text-[#FC7A0B] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-[#FC7A0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.websiteName}</span>
                    <span>•</span>
                    <span className="truncate">{item.clientName}</span>
                  </Link>

                  {/* Field Values */}
                  <div className="space-y-2 text-xs">
                    {item.accessUrl && (
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">URL Akses</p>
                          <p className="font-mono text-slate-800 dark:text-slate-200 truncate">{item.accessUrl}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={item.accessUrl.startsWith("http") ? item.accessUrl : `https://${item.accessUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-[#011D58] dark:hover:text-blue-400 rounded-lg"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                          <button onClick={() => handleCopy(item.accessUrl, "URL")} className="p-1.5 text-slate-400 hover:text-[#FC7A0B] rounded-lg">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="overflow-hidden">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Username</p>
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{item.username}</p>
                      </div>
                      <button onClick={() => handleCopy(item.username, "Username")} className="p-1.5 text-slate-400 hover:text-[#FC7A0B] rounded-lg shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="overflow-hidden">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Password</p>
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          {isShowPass ? (item.password || "Tanpa Sandi") : "••••••••••••"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePassword(item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => handleCopy(item.password, "Password")} className="p-1.5 text-slate-400 hover:text-[#FC7A0B] rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500">
            Tidak ada kredensial yang ditemukan.
          </div>
        )}
      </div>

      {/* Modal Tambah Kredensial Baru */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full z-10 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tambah Akses Kredensial Baru</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Proyek Website *</label>
                  <select
                    value={newCred.websiteId}
                    onChange={(e) => setNewCred({ ...newCred, websiteId: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                  >
                    {websites.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.clientName})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Kategori *</label>
                    <select
                      value={newCred.category}
                      onChange={(e) => setNewCred({ ...newCred, category: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                    >
                      <option value="cPanel">cPanel / Hosting</option>
                      <option value="Database">Database</option>
                      <option value="VPS">VPS / SSH</option>
                      <option value="GitHub">GitHub / GitLab</option>
                      <option value="Admin Panel">Admin Panel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Username / User *</label>
                    <input
                      type="text"
                      required
                      value={newCred.username}
                      onChange={(e) => setNewCred({ ...newCred, username: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
                    <input
                      type="text"
                      value={newCred.password}
                      onChange={(e) => setNewCred({ ...newCred, password: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">URL Akses</label>
                    <input
                      type="text"
                      value={newCred.accessUrl}
                      onChange={(e) => setNewCred({ ...newCred, accessUrl: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#011D58] text-white font-bold rounded-xl text-sm">
                    {isSubmitting ? "Simpan..." : "Simpan Akses"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}