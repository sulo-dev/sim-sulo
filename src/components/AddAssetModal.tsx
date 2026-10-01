"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createAsset } from "@/actions/assetActions";

type UserDropdown = { id: string; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  users: UserDropdown[];
  onSuccess: () => void;
  showToast?: (message: string, type: "success" | "error") => void;
};

type FieldKey =
  | "assetCode"
  | "category"
  | "name"
  | "purchaseDate"
  | "price"
  | "condition"
  | "status"
  | "assignedTo"
  | "notes";

export default function AddAssetModal({
  isOpen,
  onClose,
  users,
  onSuccess,
  showToast,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  // Form State
  const [assetCode, setAssetCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Laptop");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Good");
  const [status, setStatus] = useState("Available");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  // State Penanganan Validasi Inline 1 per 1
  const [fieldError, setFieldError] = useState<{
    field: FieldKey | null;
    message: string | null;
  }>({
    field: null,
    message: null,
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitStatus("idle");
      setIsLoading(false);
      setAssetCode("");
      setName("");
      setCategory("Laptop");
      setPurchaseDate("");
      setPrice("");
      setCondition("Good");
      setStatus("Available");
      setAssignedTo("");
      setNotes("");
      setFieldError({ field: null, message: null });
    }, 300);
  };

  const clearFieldError = (fieldName: FieldKey) => {
    if (fieldError.field === fieldName) {
      setFieldError({ field: null, message: null });
    }
  };

  // Format Uang Rupiah Otomatis saat mengetik
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    clearFieldError("price");

    if (inputVal === "" || inputVal === "Rp" || inputVal === "Rp ") {
      setPrice("");
      return;
    }
    const numericValue = inputVal.replace(/[^0-9]/g, "");
    if (numericValue) {
      const formatted = new Intl.NumberFormat("id-ID").format(Number(numericValue));
      setPrice(`Rp ${formatted}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError({ field: null, message: null });

    const trimmedCode = assetCode.trim();
    const trimmedName = name.trim();

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    // 1. Validasi Kode Aset
    if (!trimmedCode) {
      setFieldError({
        field: "assetCode",
        message: "Kode aset wajib diisi (Contoh: AST-001)!",
      });
      return;
    }

    // 2. Validasi Kategori
    if (!category) {
      setFieldError({
        field: "category",
        message: "Silakan pilih kategori aset!",
      });
      return;
    }

    // 3. Validasi Nama Perangkat
    if (!trimmedName) {
      setFieldError({
        field: "name",
        message: "Nama perangkat / aset wajib diisi!",
      });
      return;
    }

    // 4. Validasi Status Penggunaan & Anggota Tim Terkait
    if (!status) {
      setFieldError({
        field: "status",
        message: "Silakan pilih status penggunaan aset!",
      });
      return;
    }

    if (status === "In Use" && !assignedTo) {
      setFieldError({
        field: "assignedTo",
        message: "Pilih anggota tim jika status aset sedang digunakan (In Use)!",
      });
      return;
    }

    // Proses Pengiriman Data
    setIsLoading(true);

    const payload = {
      assetCode: trimmedCode,
      name: trimmedName,
      category,
      purchaseDate,
      price,
      condition,
      status,
      assignedTo: assignedTo || null,
      notes: notes.trim(),
    };

    const res = await createAsset(payload);

    if (res.success) {
      setSubmitStatus("success");
      if (showToast) showToast("Aset baru berhasil ditambahkan!", "success");

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } else {
      setIsLoading(false);
      const errMsg = res.message || "Gagal menambahkan aset ke database server.";
      setFieldError({
        field: "assetCode",
        message: errMsg,
      });
      if (showToast) showToast(errMsg, "error");
    }
  };

  // Helper kelas CSS untuk input/select (normal vs error)
  const getInputClasses = (fieldName: FieldKey) => {
    const base =
      "w-full text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none ";
    if (fieldError.field === fieldName) {
      return (
        base +
        "bg-slate-50 dark:bg-slate-950/50 border border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
      );
    }
    return (
      base +
      "bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={submitStatus === "idle" && !isLoading ? handleClose : undefined}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        <AnimatePresence mode="wait">
          {submitStatus === "idle" && (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tambah Aset Baru</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Catat inventaris hardware operasional perusahaan.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-rose-500 bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* Field 1 & 2: Kode Aset & Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Kode Aset <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={assetCode}
                        onChange={(e) => {
                          setAssetCode(e.target.value.toUpperCase());
                          clearFieldError("assetCode");
                        }}
                        placeholder="Contoh: AST-001"
                        className={getInputClasses("assetCode")}
                      />
                      <AnimatePresence>
                        {fieldError.field === "assetCode" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Kategori <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          clearFieldError("category");
                        }}
                        className={`${getInputClasses("category")} cursor-pointer`}
                      >
                        <option value="Laptop">Laptop / PC</option>
                        <option value="Smartphone">Smartphone / Tablet</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Furniture">Furniture (Meja/Kursi)</option>
                        <option value="Kendaraan">Kendaraan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <AnimatePresence>
                        {fieldError.field === "category" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Field 3: Nama Perangkat */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Nama Perangkat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearFieldError("name");
                      }}
                      placeholder="Contoh: MacBook Pro M2 14-inch"
                      className={getInputClasses("name")}
                    />
                    <AnimatePresence>
                      {fieldError.field === "name" && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fieldError.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Field 4 & 5: Tanggal Pembelian & Harga Beli */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Tanggal Pembelian
                      </label>
                      <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => {
                          setPurchaseDate(e.target.value);
                          clearFieldError("purchaseDate");
                        }}
                        className={`${getInputClasses("purchaseDate")} dark:[color-scheme:dark]`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Harga Beli
                      </label>
                      <input
                        type="text"
                        value={price}
                        onChange={handlePriceChange}
                        placeholder="Rp 0"
                        className={`${getInputClasses("price")} font-semibold`}
                      />
                    </div>
                  </div>

                  {/* Panel Kondisi & Status Penggunaan */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          Kondisi Barang <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={condition}
                          onChange={(e) => {
                            setCondition(e.target.value);
                            clearFieldError("condition");
                          }}
                          className={`${getInputClasses("condition")} cursor-pointer`}
                        >
                          <option value="Good">🟢 Baik (Good)</option>
                          <option value="Repair">🟡 Perbaikan (Repair)</option>
                          <option value="Damaged">🔴 Rusak (Damaged)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          Status Penggunaan <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={status}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStatus(val);
                            if (val !== "In Use") setAssignedTo("");
                            clearFieldError("status");
                          }}
                          className={`${getInputClasses("status")} cursor-pointer`}
                        >
                          <option value="Available">Tersedia (Di Kantor)</option>
                          <option value="In Use">Sedang Digunakan</option>
                          <option value="Retired">Dipensiunkan / Hilang</option>
                        </select>
                        <AnimatePresence>
                          {fieldError.field === "status" && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {fieldError.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Assigned To Conditional Field */}
                    <AnimatePresence>
                      {status === "In Use" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 mt-1">
                            Ditugaskan Kepada (Peminjam) <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={assignedTo}
                            onChange={(e) => {
                              setAssignedTo(e.target.value);
                              clearFieldError("assignedTo");
                            }}
                            className={`${getInputClasses("assignedTo")} cursor-pointer`}
                          >
                            <option value="">-- Pilih Anggota Tim --</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                          <AnimatePresence>
                            {fieldError.field === "assignedTo" && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {fieldError.message}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Ada lecet di ujung layar..."
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Aset"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Success View State */}
          {submitStatus === "success" && (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
              className="p-10 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">
                Aset Ditambahkan!
              </h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Data inventaris hardware perusahaan telah tersimpan dengan sukses di sistem SULO-MIS.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}