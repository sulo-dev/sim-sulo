"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";
import InfrastructureModal from "@/components/InfrastructureModal";
import EditWebsiteModal from "@/components/EditWebsiteModal";
import { mockWebsite } from "@/lib/mockData";

export default function WebsiteDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("infrastructure");
  
  // State Infrastruktur
  const [selectedInfra, setSelectedInfra] = useState<any | null>(null);
  const [infrastructures, setInfrastructures] = useState(mockWebsite.infrastructures);

  // State Modal (Edit & Hapus)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Dokumen
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);

  // State Modul Notifikasi Toast Sukses
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3500); // Otomatis hilang dalam 3.5 detik
  };

  // ==========================================
  // FUNGSI-FUNGSI AKSI
  // ==========================================

  // 1. Hapus Proyek
  const handleDeleteProject = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      triggerNotification("Proyek website berhasil dihapus dari sistem.");
      setTimeout(() => {
        router.push("/websites"); // Arahkan kembali ke direktori utama setelah toast muncul
      }, 1000);
    }, 1500);
  };

  // 2. Perpanjang Infrastruktur
  const handleRenewInfra = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation(); // Mencegah modal detail terbuka saat tombol perpanjang diklik
    setInfrastructures(infrastructures.map(infra => 
      infra.id === id ? { ...infra, status: 'Safe', expiry: '2027-10-15 (Diperbarui)' } : infra
    ));
    triggerNotification("Masa aktif infrastruktur berhasil diperpanjang.");
  };

  // 3. Unggah Berkas
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        triggerNotification("Dokumen berhasil diunggah ke arsip proyek.");
      }, 2000);
    }
  };

  // 4. Download & Preview Dokumen PDF (Mockup Dummy Base64)
  const dummyBase64PDF = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1LBSKUrnCtRTyuVJF/v//zwcsFADyCAsRCmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKNDQKZW5kb2JqCgo0IDAgb2JqCjw8L0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGggMTI4Pj5zdHJlYW0KeJwr5HIMclXIzdcvT01OzCtOtFJIyy9SqMsvVCjJV0gqSC0qzy8t0gEKWxlYcIXkKyTml2QoRBVnJmbmKVQGFOeUpgYV6wF5ZRCVhnqGQAEGhtAAkK+XnF+SkamXmFuQk1qkr2BgoFBaUqwPNAiUBwB+EyFmCmVuZHN0cmVhbQplbmRvYmoKCjUgMCBvYmoKPDwvQ29udGVudHMgNCAwIFIvVHlwZS9QYWdlL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERi9UZXh0L0ltYWdlQi9JbWFnZUMvSW1hZ2VJXS9Gb250PDwvRjEgMiAwIFI+Pj4+L1BhcmVudCAxIDAgUi9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbNSAwIFJdPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAxIDAgUj4+CmVuZG9iagoKNyAwIG9iago8PC9DcmVhdG9yKFBERi5qcykvUHJvZHVjZXIoUERGLmpzKS9DcmVhdGlvbkRhdGUoRDoyMDI2MDkxMTAwMDAwMFopPj4KZW5kb2JqCgp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDA0MDYgMDAwMDAgbiAKMDAwMDAwMDE2MyAwMDAwMCBuIAowMDAwMDAwMjU5IDAwMDAwIG4gCjAwMDAwMDAzNTkgMDAwMDAgbiAKMDAwMDAwMDQ2MyAwMDAwMCBuIAowMDAwMDAwNjI4IDAwMDAwIG4gCjAwMDAwMDA2ODQgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDgvUm9vdCA2IDAgUi9JbmZvIDcgMCBSPj4Kc3RhcnR4cmVmCjc5MQolJUVPRgo=";

  const handleDownloadPDF = (fileName: string) => {
    const byteCharacters = atob(dummyBase64PDF);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    triggerNotification(`Dokumen "${fileName}" berhasil diunduh.`);
  };

  const handlePreviewPDF = () => {
    setPreviewPdf(`data:application/pdf;base64,${dummyBase64PDF}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Input File Tersembunyi untuk Upload Dokumen */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />

      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
          <Link href="/clients" className="hover:text-[#FA4D09] transition-colors">Klien</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200">{mockWebsite.clientName}</span>
          <span>/</span>
          <span className="text-[#FC7A0B] font-bold">{mockWebsite.name}</span>
        </div>
        
        <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
          {/* Ornamen Glow 3D */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#011D58]/5 dark:bg-[#011D58]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{mockWebsite.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <a href={mockWebsite.productionUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-[#FC7A0B] hover:text-[#FA4D09] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Production URL
              </a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Go-Live: {mockWebsite.goLiveDate}
              </span>
            </div>
            
            <div className="flex gap-2 mt-5">
              {mockWebsite.techStack.map(tech => (
                <span key={tech} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-[#011D58]/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#011D58]/50 shadow-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 relative z-10">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border shadow-sm ${
              mockWebsite.status === 'Active Contract' 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                : 'bg-[#FF9F03]/10 text-[#FC7A0B] border-[#FF9F03]/20'
            }`}>
              {mockWebsite.status}
            </span>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-colors font-bold text-sm">
                Hapus
              </button>
              <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Proyek
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto overflow-x-auto no-scrollbar shadow-sm">
        {['infrastructure', 'credentials', 'tickets', 'documents'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all capitalize whitespace-nowrap shrink-0 ${
              activeTab === tab 
                ? 'bg-[#011D58] text-white shadow-md shadow-[#011D58]/20' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab === 'infrastructure' ? 'Infrastruktur' : 
             tab === 'credentials' ? 'Kredensial (Vault)' : 
             tab === 'tickets' ? 'Tiket / Masalah' : 'Dokumen Legal'}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'infrastructure' && (
            <motion.div key="infrastructure" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {infrastructures.map((infra) => (
                <div 
                  key={infra.id} 
                  onClick={() => setSelectedInfra(infra)}
                  className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-[#FC7A0B] dark:hover:border-[#FC7A0B]/50 transition-all duration-300 cursor-pointer group shadow-lg shadow-slate-100 dark:shadow-none relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#011D58] dark:text-[#FF9F03] bg-[#011D58]/10 dark:bg-[#FF9F03]/10 px-2.5 py-1 rounded-md">
                      {infra.type}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      infra.status === 'Safe' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' : 'text-[#FA4D09] bg-[#FA4D09]/10'
                    }`}>
                      {infra.status === 'Warning' && <span className="w-1.5 h-1.5 rounded-full bg-[#FA4D09] animate-pulse"></span>}
                      {infra.status === 'Warning' ? 'Segera Expired' : 'Aman'}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors">{infra.asset}</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1">{infra.provider}</p>
                  
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Berakhir pada:</span>
                      <span className={`font-bold mt-0.5 ${infra.status === 'Warning' ? 'text-[#FA4D09]' : 'text-slate-700 dark:text-slate-300'}`}>
                        {infra.expiry}
                      </span>
                    </div>
                    
                    {/* TOMBOL PERPANJANG */}
                    {infra.status === 'Warning' && (
                      <button 
                        onClick={(e) => handleRenewInfra(e, infra.id)}
                        className="px-4 py-1.5 bg-[#FC7A0B] hover:bg-[#FA4D09] text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-[#FC7A0B]/20"
                      >
                        Perpanjang
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'credentials' && (
            <motion.div key="credentials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mockWebsite.credentials.map((cred) => (
                <div key={cred.id} className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-[#FC7A0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{cred.category} Access</h4>
                  </div>
                  <a href={cred.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#FC7A0B] hover:text-[#FA4D09] hover:underline mb-5 inline-block transition-colors">{cred.url}</a>
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Username</span>
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-mono font-medium">{cred.username}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                      <span className="text-xs font-semibold text-slate-500">Password</span>
                      <button className="text-xs font-bold text-[#011D58] dark:text-[#FF9F03] hover:text-[#FA4D09] transition-colors flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Tampilkan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'tickets' && (
            <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <KanbanBoard />
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              {/* Header Dokumen & Tombol Upload */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg shadow-slate-100 dark:shadow-none">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Arsip Dokumen Serah Terima</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Kelola SPK, BAST, dan panduan pengguna terkait proyek ini.</p>
                </div>
                <button 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {isUploading ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Mengunggah...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Unggah Berkas</>
                  )}
                </button>
              </div>

              {/* Grid Dokumen */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mockWebsite.documents?.map((doc) => (
                  <div key={doc.id} className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-[#FC7A0B] dark:hover:border-[#FC7A0B]/50 transition-colors group shadow-lg shadow-slate-100 dark:shadow-none flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <div className="p-3 bg-[#FA4D09]/10 text-[#FA4D09] rounded-xl shadow-inner">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                          doc.type === 'BAST' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                          doc.type === 'SPK' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                          'bg-[#FF9F03]/10 text-[#FC7A0B] border-[#FF9F03]/20'
                        }`}>
                          {doc.type}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-[#FA4D09] transition-colors line-clamp-2">
                        {doc.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-5">{doc.size} • Diunggah oleh <span className="text-slate-700 dark:text-slate-300">{doc.uploadedBy}</span></p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">{doc.date}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleDownloadPDF(doc.title)} className="p-2 text-slate-400 hover:text-[#FA4D09] hover:bg-[#FA4D09]/10 rounded-lg transition-colors" title="Unduh">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button onClick={handlePreviewPDF} className="p-2 text-slate-400 hover:text-[#011D58] dark:hover:text-[#FF9F03] hover:bg-[#011D58]/10 dark:hover:bg-[#FF9F03]/10 rounded-lg transition-colors" title="Lihat Pratinjau">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL INFRASTRUKTUR */}
      <AnimatePresence>
        {selectedInfra && (
          <InfrastructureModal 
            isOpen={!!selectedInfra} 
            onClose={() => setSelectedInfra(null)} 
            data={selectedInfra} 
          />
        )}
      </AnimatePresence>

      {/* MODAL EDIT WEBSITE */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditWebsiteModal 
            isOpen={isEditModalOpen} 
            onClose={() => {
              setIsEditModalOpen(false);
              triggerNotification("Perubahan data proyek website berhasil disimpan!");
            }} 
            website={mockWebsite} 
          />
        )}
      </AnimatePresence>

      {/* MODAL HAPUS WEBSITE */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full z-10 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Proyek Ini?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Data proyek <span className="font-bold text-slate-800 dark:text-slate-200">{mockWebsite.name}</span> beserta tiket, kredensial, dan dokumen di dalamnya akan dihapus.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors">Batal</button>
                <button onClick={handleDeleteProject} disabled={isDeleting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-70">
                  {isDeleting ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menghapus...</> : "Ya, Hapus Proyek"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PREVIEW PDF */}
      <AnimatePresence>
        {previewPdf && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewPdf(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden flex flex-col z-10 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FC7A0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  Pratinjau Dokumen
                </h3>
                <button onClick={() => setPreviewPdf(null)} className="p-2 text-slate-400 hover:text-[#FA4D09] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <iframe src={previewPdf} className="w-full h-full bg-slate-100 dark:bg-slate-950 border-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl shadow-emerald-600/30 border border-emerald-400/30 backdrop-blur-xl"
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}