"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import EditWebsiteModal from "@/components/EditWebsiteModal";
import { deleteWebsite } from "@/actions/websiteActions";
import AddDocumentModal from "@/components/AddDocumentModal";
import EditDocumentModal from "@/components/EditDocumentModal"; 
import { deleteDocument } from "@/actions/documentActions"; 

type DocumentData = { id: number; title: string; date: string; fileUrl: string; };
type ClientDropdown = { id: number; companyName: string };

type WebsiteDetailProps = {
  website: {
    id: number;
    name: string;
    status: string;
    clientId: number;
    clientName: string;
    techStack: string;
    productionUrl: string;
    documents: DocumentData[];
  } | null;
  allClients: ClientDropdown[];
};

// Framer Motion Variants
const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function WebsiteDetailClient({ website, allClients }: WebsiteDetailProps) {
  const router = useRouter();

  // Safety fallback
  const [cachedWebsite] = useState(website);

  // State Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State Dokumen Modals
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<DocumentData | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentData | null>(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

  // State Toast Custom
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 5000); // Disamakan 5 detik
  };

  // FUNGSI UNDUH
  const handleDownloadDocument = (docName: string, fileUrl: string) => {
    if (!fileUrl) return alert("Tautan file tidak tersedia.");
    
    triggerNotification(`Mengunduh dokumen "${docName}"...`);
    
    const downloadUrl = fileUrl.includes("vercel-storage.com") ? `${fileUrl}?download=1` : fileUrl;
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = docName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // FUNGSI EKSEKUSI HAPUS DOKUMEN
  const executeDeleteDocument = async () => {
    if (!documentToDelete || !cachedWebsite) return;
    setIsDeletingDoc(true);
    
    const res = await deleteDocument(documentToDelete.id, documentToDelete.fileUrl, cachedWebsite.id);
    
    if (res.success) {
      triggerNotification(`Dokumen "${documentToDelete.title}" berhasil dihapus.`);
      setDocumentToDelete(null);
      router.refresh();
    } else {
      alert("Gagal menghapus dokumen: " + res.message);
    }
    setIsDeletingDoc(false);
  };

  // FUNGSI EKSEKUSI HAPUS PROYEK (Website)
  const executeDeleteWebsite = async () => {
    if (!cachedWebsite) return;
    setIsDeleting(true);
    const res = await deleteWebsite(cachedWebsite.id);
    
    if (res.success) {
      sessionStorage.setItem("sulo-toast-success", `Proyek ${cachedWebsite.name} telah dihapus permanen.`);
      router.push("/websites");
    } else {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      alert("Gagal menghapus: " + res.message);
    }
  };

  if (!cachedWebsite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-8 max-w-3xl mx-auto">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Proyek Tidak Ditemukan</h3>
        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">Data website yang Anda cari mungkin telah dihapus permanen dari sistem.</p>
        <Link href="/websites" className="px-6 py-3 bg-[#011D58] hover:bg-[#022b82] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#011D58]/20 transition-all">
          Kembali ke Direktori Proyek
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative pb-12">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium bg-white/40 dark:bg-slate-900/40 w-max px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <Link href="/websites" className="hover:text-[#FA4D09] dark:hover:text-[#FF9F03] transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          Proyek Website
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-slate-900 dark:text-slate-200 font-bold">{cachedWebsite.name}</span>
      </div>

      {/* Hero Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Dekorasi Latar */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FC7A0B]/10 to-transparent dark:from-[#FC7A0B]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#011D58] to-[#FC7A0B] shadow-inner flex items-center justify-center text-white text-3xl sm:text-4xl font-black uppercase ring-4 ring-white dark:ring-slate-950 shrink-0">
            {cachedWebsite.name.charAt(0)}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {cachedWebsite.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                cachedWebsite.status === "Active" 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
              }`}>
                {cachedWebsite.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                {cachedWebsite.status}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Terdaftar di SULO-MIS</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full lg:w-auto mt-2 lg:mt-0">
          {cachedWebsite.productionUrl && (
            <a 
              href={cachedWebsite.productionUrl.startsWith('http') ? cachedWebsite.productionUrl : `https://${cachedWebsite.productionUrl}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 lg:flex-none justify-center px-4 py-2.5 bg-white dark:bg-slate-800 hover:text-[#FA4D09] dark:hover:text-[#FF9F03] text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Kunjungi Web
            </a>
          )}
          <button onClick={() => setIsEditModalOpen(true)} className="flex-1 lg:flex-none justify-center px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#011D58]/20 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Proyek
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all shadow-sm" title="Hapus Permanen">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Grid Informasi Detail (Mini Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href={`/clients/${cachedWebsite.clientId}`} className="block h-full group">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm group-hover:border-[#FC7A0B]/50 transition-colors h-full">
            <span className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 group-hover:bg-[#FC7A0B]/10 group-hover:text-[#FC7A0B] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </span>
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Kepemilikan Klien</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate group-hover:text-[#FC7A0B] transition-colors">{cachedWebsite.clientName}</p>
            </div>
          </div>
        </Link>
        
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <span className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Tech Stack Utama</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{cachedWebsite.techStack || 'Tidak diatur'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <span className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">ID Sistem (SULO-MIS)</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate font-mono">WEB-{cachedWebsite.id.toString().padStart(4, "0")}</p>
          </div>
        </div>
      </div>

      {/* Bagian Dokumen */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-1.5 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </span>
            Dokumen & Berkas Proyek ({cachedWebsite.documents.length})
          </h3>
          <button
            onClick={() => setIsAddDocumentModalOpen(true)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 text-[#011D58] dark:text-white hover:text-[#FA4D09] dark:hover:text-[#FF9F03] hover:border-[#FA4D09]/50 dark:hover:border-[#FF9F03]/50 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Upload Dokumen
          </button>
        </div>

        <motion.div 
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {cachedWebsite.documents.length > 0 ? (
              cachedWebsite.documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group shadow-sm hover:border-[#FC7A0B]/40 dark:hover:border-[#FF9F03]/40 hover:shadow-md hover:shadow-[#FC7A0B]/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 line-clamp-1">{doc.title}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Diunggah pada {doc.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleDownloadDocument(doc.title, doc.fileUrl)} title="Unduh ke Perangkat" className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#011D58] hover:text-white text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button onClick={() => setDocumentToEdit(doc)} title="Edit Nama Dokumen" className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#FC7A0B] dark:hover:bg-[#FF9F03] hover:text-white text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => setDocumentToDelete(doc)} title="Hapus Dokumen" className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-rose-500 dark:text-rose-400 rounded-xl transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Belum Ada Dokumen</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Belum ada file desain, dokumen teknis, atau kontrak yang diunggah untuk proyek ini.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* SEMUA MODALS DENGAN router.refresh() PADA onSuccess */}
      <AnimatePresence>
        {isAddDocumentModalOpen && (
          <AddDocumentModal 
            isOpen={isAddDocumentModalOpen} 
            onClose={() => setIsAddDocumentModalOpen(false)} 
            websiteId={cachedWebsite.id} 
            onSuccess={() => {
              triggerNotification("Dokumen baru berhasil ditambahkan!");
              router.refresh();
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && (
          <EditWebsiteModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            website={cachedWebsite} 
            clients={allClients} 
            onSuccess={() => {
              triggerNotification("Detail Proyek berhasil diperbarui!");
              router.refresh();
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {documentToEdit && (
          <EditDocumentModal 
            isOpen={!!documentToEdit} 
            onClose={() => setDocumentToEdit(null)} 
            document={documentToEdit} 
            websiteId={cachedWebsite.id} 
            onSuccess={() => {
              triggerNotification("Nama dokumen berhasil diperbarui!");
              router.refresh();
            }} 
          />
        )}
      </AnimatePresence>

      {/* MODAL HAPUS DOKUMEN KHUSUS */}
      <AnimatePresence>
        {documentToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeletingDoc && setDocumentToDelete(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center z-10 shadow-2xl">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-500/20 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Dokumen?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Dokumen <span className="font-bold text-slate-800 dark:text-slate-200">"{documentToDelete.title}"</span> akan dihapus selamanya dari sistem dan penyimpanan (Vercel Blob).
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDocumentToDelete(null)} disabled={isDeletingDoc} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors disabled:opacity-50">Batal</button>
                <button onClick={executeDeleteDocument} disabled={isDeletingDoc} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-70 transition-colors">
                  {isDeletingDoc ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menghapus...</> : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL HAPUS PROYEK WEBSITE */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeleting && setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 z-10 text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-rose-100 dark:border-rose-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Proyek Website?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Anda yakin ingin menghapus permanen proyek <span className="font-bold text-slate-800 dark:text-slate-200">"{cachedWebsite.name}"</span>? Seluruh data infrastruktur dan dokumen yang terhubung akan ikut terhapus selamanya.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors disabled:opacity-50">Batal</button>
                <button onClick={executeDeleteWebsite} disabled={isDeleting} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-70">
                  {isDeleting ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menghapus...</> : "Ya, Hapus Permanen"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFIKASI KANAN ATAS */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl shadow-emerald-600/30 border border-emerald-400/30 backdrop-blur-xl"
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