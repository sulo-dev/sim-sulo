"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createDocument } from "@/actions/documentActions";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  websiteId: number;
  onSuccess?: () => void;
  showToast?: (message: string, type: "success" | "error") => void; // Menambahkan opsi showToast untuk keseragaman UI
};

export default function AddDocumentModal({ isOpen, onClose, websiteId, onSuccess, showToast }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  
  // State Form
  const [title, setTitle] = useState("");
  const [type, setType] = useState("BAST");
  
  // Menyimpan objek File fisik untuk dikirim ke server
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [simulatedFileSize, setSimulatedFileSize] = useState("0 KB");
  
  // State untuk menyimpan pesan error khusus file
  const [fileError, setFileError] = useState("");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setTitle("");
      setType("BAST");
      setSelectedFile(null);
      setFileError(""); // Reset error saat ditutup
      setIsLoading(false);
    }, 300);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(""); // Bersihkan error sebelumnya
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // VALIDASI: Cek ukuran file (Maksimal 2MB = 2 * 1024 * 1024 bytes)
      const maxSizeInBytes = 2 * 1024 * 1024;
      
      if (file.size > maxSizeInBytes) {
        setFileError("Ukuran file terlalu besar! Maksimal ukuran file adalah 2 MB.");
        e.target.value = ""; // Reset input file agar user bisa memilih ulang file yang sama jika perlu
        setSelectedFile(null); // Pastikan state file kosong
        return; 
      }

      // Jika lolos validasi, set file ke state
      setSelectedFile(file);
      
      const sizeInKb = Math.round(file.size / 1024);
      if (sizeInKb > 1024) {
        setSimulatedFileSize(`${(sizeInKb / 1024).toFixed(2)} MB`);
      } else {
        setSimulatedFileSize(`${sizeInKb} KB`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Keberadaan File
    if (!selectedFile) {
      setFileError("Pilih file dokumen terlebih dahulu.");
      return;
    }
    
    // 2. Pembersihan & Validasi Anti Spasi Kosong pada Judul Dokumen (Jika diisi)
    const trimmedTitle = title.trim();
    if (title.length > 0 && !trimmedTitle) {
      if (showToast) showToast("Judul dokumen tidak boleh hanya spasi kosong!", "error");
      else alert("Judul dokumen tidak boleh hanya spasi kosong!");
      return;
    }

    setIsLoading(true);

    // 3. Gunakan FormData untuk mengirim file fisik ke Server Action
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("websiteId", websiteId.toString());
    
    // Fallback: Jika tidak ada judul, gunakan nama file (dengan menghapus ekstensi secara aman)
    const fallbackTitle = selectedFile.name.replace(/\.[^/.]+$/, "");
    formData.append("title", trimmedTitle || fallbackTitle);
    
    formData.append("type", type);
    formData.append("uploadedBy", "Admin_SULO");
    formData.append("fileSize", simulatedFileSize);

    const res = await createDocument(formData);
    setIsLoading(false);

    if (res.success) {
      if (showToast) showToast("Dokumen berhasil diunggah!", "success");
      handleClose();
      if (onSuccess) onSuccess();
    } else {
      if (showToast) showToast("Gagal menyimpan dokumen: " + res.message, "error");
      else alert("Gagal menyimpan dokumen: " + res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={!isLoading ? handleClose : undefined} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unggah Dokumen Asli</h3>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* File Input */}
          <div>
             <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">File Dokumen (PDF, DOCX)</label>
             <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer group overflow-hidden ${
               fileError 
                ? "border-red-400 bg-red-50 dark:bg-red-500/10 dark:border-red-500/50" // Gaya jika ada error
                : "border-slate-300 dark:border-slate-700 hover:border-[#FC7A0B] dark:hover:border-[#FC7A0B] bg-slate-50 dark:bg-slate-900/50"
             }`}>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <p className="text-sm font-bold text-emerald-600 line-clamp-1 px-4">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">{simulatedFileSize}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className={`p-3 rounded-full transition-colors ${
                      fileError 
                        ? "bg-red-100 text-red-500 dark:bg-red-500/20" 
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 group-hover:text-[#FC7A0B]"
                    }`}>
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </span>
                    <p className={`text-sm font-semibold ${fileError ? "text-red-500" : "text-slate-600 dark:text-slate-400"}`}>
                      Klik untuk memilih file dokumen
                    </p>
                    <p className="text-[10px] text-slate-400">Max 2MB</p>
                  </div>
                )}
             </div>

             {/* Teks Pesan Error File */}
             <AnimatePresence>
               {fileError && (
                 <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -5 }} 
                    className="text-xs text-red-500 font-medium mt-2.5 flex items-center gap-1.5"
                  >
                   <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   {fileError}
                 </motion.p>
               )}
             </AnimatePresence>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Judul Dokumen (Opsional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Otomatis mengikuti nama file jika kosong" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] p-3 outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Kategori Dokumen</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] p-3 outline-none cursor-pointer transition-colors">
              <option value="BAST">Berita Acara Serah Terima (BAST)</option>
              <option value="Contract">Kontrak Kerjasama</option>
              <option value="Invoice">Invoice / Tagihan</option>
              <option value="Manual">Manual Book / Panduan</option>
              <option value="Other">Lainnya</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={handleClose} disabled={isLoading} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors">Batal</button>
            <button type="submit" disabled={isLoading || !selectedFile} className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#011D58]/20 disabled:opacity-50 transition-colors">
              {isLoading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Mengunggah...</>
              ) : (
                "Unggah Sekarang"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}