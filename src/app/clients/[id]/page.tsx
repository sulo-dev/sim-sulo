"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { mockClients } from "@/lib/mockData";
import { useParams, useRouter } from "next/navigation";
import EditClientModal from "@/components/EditClientModal"; 

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("websites");
  
  // State untuk Modal Edit, Delete, dan Download Loading
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  
  // State untuk Modul Notifikasi Toast Sukses
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3500);
  };
  
  const client = mockClients.find((c) => c.id.toString() === params.id);

  // FUNGSI: Mengunduh Dokumen PDF Palsu (Simulasi Mockup)
  const handleDownloadPDF = (docName: string) => {
    setDownloadingDoc(docName);
    
    setTimeout(() => {
      // String Base64 murni dari sebuah file PDF kosong yang valid
      const base64PDF = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1LBSKUrnCtRTyuVJF/v//zwcsFADyCAsRCmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKNDQKZW5kb2JqCgo0IDAgb2JqCjw8L0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGggMTI4Pj5zdHJlYW0KeJwr5HIMclXIzdcvT01OzCtOtFJIyy9SqMsvVCjJV0gqSC0qzy8t0gEKWxlYcIXkKyTml2QoRBVnJmfmKVQGFOeUpgYV6wF5ZRCVhnqGQAEGhtAAkK+XnF+SkamXmFuQk1qkr2BgoFBaUqwPNAiUBwB+EyFmCmVuZHN0cmVhbQplbmRvYmoKCjUgMCBvYmoKPDwvQ29udGVudHMgNCAwIFIvVHlwZS9QYWdlL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERi9UZXh0L0ltYWdlQi9JbWFnZUMvSW1hZ2VJXS9Gb250PDwvRjEgMiAwIFI+Pj4+L1BhcmVudCAxIDAgUi9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbNSAwIFJdPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAxIDAgUj4+CmVuZG9iagoKNyAwIG9iago8PC9DcmVhdG9yKFBERi5qcykvUHJvZHVjZXIoUERGLmpzKS9DcmVhdGlvbkRhdGUoRDoyMDI2MDkxMTAwMDAwMFopPj4KZW5kb2JqCgp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDA0MDYgMDAwMDAgbiAKMDAwMDAwMDE2MyAwMDAwMCBuIAowMDAwMDAwMjU5IDAwMDAwIG4gCjAwMDAwMDAzNTkgMDAwMDAgbiAKMDAwMDAwMDQ2MyAwMDAwMCBuIAowMDAwMDAwNjI4IDAwMDAwIG4gCjAwMDAwMDA2ODQgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDgvUm9vdCA2IDAgUi9JbmZvIDcgMCBSPj4Kc3RhcnR4cmVmCjc5MQolJUVPRgo=";
      
      const byteCharacters = atob(base64PDF);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setDownloadingDoc(null);
      triggerNotification(`Dokumen "${docName.replace(/_/g, ' ')}" berhasil diunduh.`);
    }, 1500);
  };

  // FUNGSI: Hapus Klien
  const handleDeleteClient = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      triggerNotification("Data klien berhasil dihapus dari sistem.");
      setTimeout(() => {
        router.push("/clients"); // Redirect kembali ke daftar klien setelah toast terlihat
      }, 1000);
    }, 1500);
  };

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Klien Tidak Ditemukan</h3>
        <p className="text-sm text-slate-500 mb-6">Data klien mungkin telah dihapus atau ID tidak valid.</p>
        <Link href="/clients" className="px-4 py-2 bg-[#011D58] text-white rounded-xl text-sm font-medium shadow-lg shadow-[#011D58]/20">
          Kembali ke Daftar Klien
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/clients" className="hover:text-[#FA4D09] transition-colors">Klien</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-200 font-medium">{client.companyName}</span>
      </div>

      {/* Header Profil Klien & Aksi Cepat */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ornamen Latar */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#011D58]/5 dark:bg-[#011D58]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{client.companyName}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              client.status === 'Active' 
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                : 'bg-[#FF9F03]/10 text-[#FC7A0B] border-[#FF9F03]/20'
            }`}>
              {client.status} Contract
            </span>

          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Penanggung Jawab (PIC): <span className="font-semibold text-slate-700 dark:text-slate-200">{client.picName}</span>
          </p>
        </div>

        {/* TOMBOL AKSI CEPAT */}
        <div className="flex items-center gap-3 relative z-10">
          <a 
            href={`mailto:${client.email}`} 
            className="hidden sm:flex px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#FA4D09] dark:hover:text-[#FA4D09] text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-700 items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Kirim Email
          </a>
          
          {/* TOMBOL DELETE KLIEN */}
          <button 
            onClick={() => setIsDeleteModalOpen(true)} 
            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-colors border border-red-100 dark:border-red-500/20" 
            title="Hapus Klien"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          
          {/* TOMBOL EDIT KLIEN */}
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit Klien
          </button>
        </div>
      </div>

      {/* Informasi Detail Kontak (Grid Mini) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 backdrop-blur-md hover:border-[#FC7A0B]/30 transition-colors">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Email Kontak</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{client.email || 'Tidak diatur'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 backdrop-blur-md hover:border-[#FC7A0B]/30 transition-colors">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Nomor Telepon / WA</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">0812-3456-7890 (Simulasi)</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 backdrop-blur-md hover:border-[#FC7A0B]/30 transition-colors">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Alamat Kantor</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">Jl. Perintis Kemerdekaan, Makassar</p>
        </div>
      </div>

      {/* Tab Navigasi Mini */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 pt-2">
        <button
          onClick={() => setActiveTab("websites")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "websites" 
              ? "bg-[#011D58] text-white shadow-md shadow-[#011D58]/20" 
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
          }`}
        >
          Proyek Website ({client.websites.length})
        </button>
        <button
          onClick={() => setActiveTab("contracts")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "contracts" 
              ? "bg-[#011D58] text-white shadow-md shadow-[#011D58]/20" 
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
          }`}
        >
          Riwayat Kontrak & Dokumen
        </button>
      </div>

      {/* Konten Berdasarkan Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "websites" && (
          <motion.div
            key="websites"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {client.websites.map((web, idx) => (
              <Link key={idx} href={`/websites/1`}>
                <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-[#FC7A0B] dark:hover:border-[#FC7A0B]/50 transition-all cursor-pointer group shadow-lg shadow-slate-100 dark:shadow-none flex justify-between items-center h-full">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#011D58] dark:text-[#FF9F03] bg-[#011D58]/10 dark:bg-[#FF9F03]/10 px-2 py-0.5 rounded">Active App</span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors mt-2">{web}</h4>
                    <p className="text-xs text-slate-500 mt-1">Klik untuk membuka detail infrastruktur, kredensial, & tiket</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-[#011D58] group-hover:text-white transition-all shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}

        {activeTab === "contracts" && (
          <motion.div
            key="contracts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4"
          >
            <h3 className="text-md font-bold text-slate-900 dark:text-white">Arsip Dokumen Legal Klien</h3>
            <div className="space-y-3">
              {/* TOMBOL UNDUH PDF 1 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-[#FC7A0B]/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Surat Perjanjian Kerja Sama (MoU) V1</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ditandatangani • 10 Januari 2026</p>
                </div>
                <button 
                  onClick={() => handleDownloadPDF("MoU_Kerja_Sama_V1")}
                  disabled={downloadingDoc === "MoU_Kerja_Sama_V1"}
                  className="text-xs font-bold text-[#FC7A0B] hover:text-[#FA4D09] transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {downloadingDoc === "MoU_Kerja_Sama_V1" ? (
                    <><span className="w-3.5 h-3.5 border-2 border-[#FC7A0B]/30 border-t-[#FC7A0B] rounded-full animate-spin"></span> Mengunduh...</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Unduh PDF</>
                  )}
                </button>
              </div>

              {/* TOMBOL UNDUH PDF 2 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-[#FC7A0B]/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Berita Acara Pemeliharaan Tahunan</p>
                  <p className="text-xs text-slate-400 mt-0.5">Selesai • 15 Agustus 2026</p>
                </div>
                <button 
                  onClick={() => handleDownloadPDF("Berita_Acara_Pemeliharaan")}
                  disabled={downloadingDoc === "Berita_Acara_Pemeliharaan"}
                  className="text-xs font-bold text-[#FC7A0B] hover:text-[#FA4D09] transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {downloadingDoc === "Berita_Acara_Pemeliharaan" ? (
                    <><span className="w-3.5 h-3.5 border-2 border-[#FC7A0B]/30 border-t-[#FC7A0B] rounded-full animate-spin"></span> Mengunduh...</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Unduh PDF</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI DELETE */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full z-10 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Klien Ini?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Semua data proyek, infrastruktur, dan tagihan terkait <span className="font-bold text-slate-800 dark:text-slate-200">{client.companyName}</span> akan dihapus permanen.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors">Batal</button>
                <button onClick={handleDeleteClient} disabled={isDeleting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-70">
                  {isDeleting ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menghapus...</>
                  ) : "Ya, Hapus Klien"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EDIT KLIEN */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditClientModal 
            isOpen={isEditModalOpen} 
            onClose={() => {
              setIsEditModalOpen(false);
              triggerNotification("Perubahan data klien berhasil disimpan!");
            }} 
            client={client} 
          />
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