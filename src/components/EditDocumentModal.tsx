"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateDocument } from "@/actions/documentActions";

type DocumentData = {
  id: number;
  title: string;
  date: string;
  fileUrl: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData;
  websiteId: number;
  onSuccess: () => void;
  showToast?: (message: string, type: "success" | "error") => void; // Penambahan prop showToast
};

// BATAS MAKSIMAL UKURAN FILE (2MB = 2 * 1024 * 1024 byte)
const MAX_FILE_SIZE = 2 * 1024 * 1024; 

export default function EditDocumentModal({ isOpen, onClose, document, websiteId, onSuccess, showToast }: Props) {
  const [title, setTitle] = useState(document.title);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk menyimpan pesan error khusus file
  const [fileError, setFileError] = useState("");

  // Sinkronisasi data saat modal terbuka untuk memastikan data yang diedit selalu yang terbaru
  useEffect(() => {
    if (isOpen && document) {
      setTitle(document.title);
      setSelectedFile(null);
      setFileError("");
    }
  }, [isOpen, document]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(""); // Bersihkan error sebelumnya setiap kali memilih file

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // VALIDASI UKURAN FILE
      if (file.size > MAX_FILE_SIZE) {
        setFileError("Ukuran file terlalu besar! Maksimal ukuran file adalah 2 MB.");
        e.target.value = ""; // Reset input file
        setSelectedFile(null); // Pastikan state file kosong
        return;
      }
      
      // Jika lolos validasi
      setSelectedFile(file);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setFileError(""); // Reset error saat ditutup
      setSelectedFile(null);
      setIsLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validasi Anti-Spasi Kosong
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      if (showToast) showToast("Judul dokumen tidak boleh kosong atau hanya spasi!", "error");
      else alert("Judul dokumen tidak boleh kosong atau hanya spasi!");
      return;
    }
    
    // 2. Cegah submit jika ada error file yang belum terselesaikan
    if (fileError) return;

    setIsLoading(true);

    // 3. Menggunakan FormData karena kita berpotensi mengirim File Fisik baru
    const formData = new FormData();
    formData.append("documentId", document.id.toString());
    formData.append("websiteId", websiteId.toString());
    formData.append("title", trimmedTitle); // Gunakan judul yang sudah dibersihkan
    formData.append("oldFileUrl", document.fileUrl);
    
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    const res = await updateDocument(formData);
    setIsLoading(false);
    
    if (res.success) {
      if (showToast) showToast("Dokumen berhasil diperbarui!", "success");
      onSuccess();
      handleClose();
    } else {
      if (showToast) showToast("Gagal memperbarui: " + res.message, "error");
      else alert("Gagal memperbarui: " + res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={!isLoading ? handleClose : undefined} 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden z-10 shadow-2xl"
      >
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] rounded-xl shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Dokumen</h3>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Input Judul */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Nama / Judul Dokumen *</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Masukkan judul dokumen..."
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:border-[#FC7A0B] transition-colors" 
            />
          </div>

          {/* Input File Opsional untuk Mengganti (Replace) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Ganti File (Opsional)
            </label>
            <div className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-colors cursor-pointer group overflow-hidden ${
              fileError 
                ? "border-red-400 bg-red-50 dark:bg-red-500/10 dark:border-red-500/50" // Gaya Error
                : "border-slate-300 dark:border-slate-700 hover:border-[#FC7A0B] dark:hover:border-[#FC7A0B] bg-slate-50 dark:bg-slate-900/50"
            }`}>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="p-2 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span>
                  <p className="text-xs font-bold text-[#FC7A0B] line-clamp-1">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className={`p-2 rounded-full transition-colors ${
                    fileError 
                      ? "bg-red-100 text-red-500 dark:bg-red-500/20" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 group-hover:text-[#FC7A0B]"
                  }`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></span>
                  <p className={`text-xs font-semibold ${fileError ? "text-red-500" : "text-slate-600 dark:text-slate-400"}`}>
                    Klik untuk mengganti file (Max 2 MB)
                  </p>
                  <p className="text-[10px] text-slate-400">Biarkan kosong jika hanya mengedit judul.</p>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={handleClose} disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Batal</button>
            <button type="submit" disabled={isLoading || !!fileError} className="px-5 py-2.5 text-sm font-bold text-white bg-[#011D58] hover:bg-[#011D58]/90 rounded-xl flex items-center gap-2 shadow-lg shadow-[#011D58]/20 disabled:opacity-50 transition-colors">
              {isLoading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menyimpan...</>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}