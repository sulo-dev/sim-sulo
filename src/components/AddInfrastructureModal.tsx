"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createInfrastructure } from "@/actions/infrastructureActions";
import { formatDateIndo } from "@/lib/utils";

type WebsiteDropdown = { id: number; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteDropdown[];
  onSuccess?: () => void;
};

type FieldKey =
  | "type"
  | "provider"
  | "assetName"
  | "websiteId"
  | "expiry"
  | "renewalPrice";

export default function AddInfrastructureModal({ isOpen, onClose, websites, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  // State Form Input
  const [type, setType] = useState("");
  const [provider, setProvider] = useState("");
  const [assetName, setAssetName] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [expiry, setExpiry] = useState("");
  const [renewalPrice, setRenewalPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("Tahun");
  const [autoRenew, setAutoRenew] = useState(false);
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
      setType("");
      setProvider("");
      setAssetName("");
      setWebsiteId("");
      setExpiry("");
      setRenewalPrice("");
      setBillingCycle("Tahun");
      setAutoRenew(false);
      setNotes("");
      setFieldError({ field: null, message: null });
    }, 300);
  };

  const clearFieldError = (fieldName: FieldKey) => {
    if (fieldError.field === fieldName) {
      setFieldError({ field: null, message: null });
    }
  };

  // Format angka menjadi Rupiah otomatis saat diketik
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    clearFieldError("renewalPrice");

    if (inputVal === "" || inputVal === "Rp" || inputVal === "Rp ") {
      setRenewalPrice("");
      return;
    }

    const numericValue = inputVal.replace(/[^0-9]/g, "");
    if (numericValue) {
      const formatted = new Intl.NumberFormat("id-ID").format(Number(numericValue));
      setRenewalPrice(`Rp ${formatted}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError({ field: null, message: null });

    const trimmedProvider = provider.trim();
    const trimmedAssetName = assetName.trim();

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    // 1. Validasi Tipe Aset
    if (!type) {
      setFieldError({
        field: "type",
        message: "Silakan pilih tipe aset infrastruktur!",
      });
      return;
    }

    // 2. Validasi Provider
    if (!trimmedProvider) {
      setFieldError({
        field: "provider",
        message: "Nama provider wajib diisi dan tidak boleh hanya spasi!",
      });
      return;
    }

    // 3. Validasi Nama Aset / Domain
    if (!trimmedAssetName) {
      setFieldError({
        field: "assetName",
        message: "Nama aset / domain wajib diisi dan tidak boleh hanya spasi!",
      });
      return;
    }

    // 4. Validasi Proyek Terkait
    if (!websiteId) {
      setFieldError({
        field: "websiteId",
        message: "Silakan pilih proyek / website terkait!",
      });
      return;
    }

    // 5. Validasi Tanggal Expired
    if (!expiry) {
      setFieldError({
        field: "expiry",
        message: "Tanggal expired wajib ditentukan!",
      });
      return;
    }

    // 6. Validasi Biaya Perpanjangan
    if (!renewalPrice || renewalPrice === "Rp " || renewalPrice === "Rp") {
      setFieldError({
        field: "renewalPrice",
        message: "Biaya perpanjangan wajib diisi!",
      });
      return;
    }

    // Proses Pengiriman Data
    setIsLoading(true);

    const newInfraData = {
      websiteId: Number(websiteId),
      type,
      provider: trimmedProvider,
      asset: trimmedAssetName,
      expiry,
      status: "Active",
      purchaseDate: new Date().toISOString().split("T")[0],
      renewalPrice: renewalPrice,
      billingCycle: billingCycle,
      autoRenew: autoRenew,
      notes: notes.trim(),
    };

    const res = await createInfrastructure(newInfraData);

    if (res.success) {
      setSubmitStatus("success");
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setIsLoading(false);
      setFieldError({
        field: "type",
        message: res.message || "Gagal menambahkan aset ke database server.",
      });
    }
  };

  // Helper kelas CSS untuk input (normal vs error)
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
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
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
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registrasi Aset Infrastruktur</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Tambah detail provider dan jadwal perpanjangan.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  
                  {/* Field 1 & 2: Tipe Aset & Provider */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Tipe Aset <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={type}
                        onChange={(e) => {
                          setType(e.target.value);
                          clearFieldError("type");
                        }}
                        className={`${getInputClasses("type")} cursor-pointer`}
                      >
                        <option value="">-- Pilih Tipe --</option>
                        <option value="Domain">Domain</option>
                        <option value="Hosting">Hosting</option>
                        <option value="Server">Server / VPS</option>
                        <option value="SSL">SSL Certificate</option>
                      </select>
                      <AnimatePresence>
                        {fieldError.field === "type" && (
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
                        Nama Provider <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={provider}
                        onChange={(e) => {
                          setProvider(e.target.value);
                          clearFieldError("provider");
                        }}
                        placeholder="Contoh: Niagahoster, Vercel"
                        className={getInputClasses("provider")}
                      />
                      <AnimatePresence>
                        {fieldError.field === "provider" && (
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

                  {/* Field 3: Nama Aset / Domain */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Nama Aset / Domain <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => {
                        setAssetName(e.target.value);
                        clearFieldError("assetName");
                      }}
                      placeholder="Contoh: desadigital.id atau Droplet 4GB"
                      className={getInputClasses("assetName")}
                    />
                    <AnimatePresence>
                      {fieldError.field === "assetName" && (
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

                  {/* Field 4 & 5: Proyek & Tanggal Expired */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Proyek Terkait <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={websiteId}
                        onChange={(e) => {
                          setWebsiteId(e.target.value);
                          clearFieldError("websiteId");
                        }}
                        className={`${getInputClasses("websiteId")} cursor-pointer`}
                      >
                        <option value="">-- Pilih Website --</option>
                        {websites.map((web) => (
                          <option key={web.id} value={web.id}>
                            {web.name}
                          </option>
                        ))}
                      </select>
                      <AnimatePresence>
                        {fieldError.field === "websiteId" && (
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
                        Tanggal Expired <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={expiry}
                        onChange={(e) => {
                          setExpiry(e.target.value);
                          clearFieldError("expiry");
                        }}
                        className={`${getInputClasses("expiry")} dark:[color-scheme:dark]`}
                      />
                      <AnimatePresence>
                        {fieldError.field === "expiry" && (
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
                      {expiry && fieldError.field !== "expiry" && (
                        <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                          Tampilan: <span className="font-bold text-slate-700 dark:text-slate-300">{formatDateIndo(expiry)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Field 6 & 7: Biaya Perpanjangan & Siklus */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Biaya Perpanjangan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={renewalPrice}
                        onChange={handlePriceChange}
                        placeholder="Rp 0"
                        className={`${getInputClasses("renewalPrice")} font-semibold`}
                      />
                      <AnimatePresence>
                        {fieldError.field === "renewalPrice" && (
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
                        Siklus Pembayaran <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={billingCycle}
                        onChange={(e) => setBillingCycle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] cursor-pointer shadow-sm dark:shadow-none"
                      >
                        <option value="Bulan">Per Bulan</option>
                        <option value="Tahun">Per Tahun</option>
                      </select>
                    </div>
                  </div>

                  {/* Auto-Renew & Notes */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer mb-5">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={autoRenew}
                          onChange={(e) => setAutoRenew(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#011D58]/20 dark:peer-focus:ring-[#FF9F03]/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#011D58] dark:peer-checked:bg-[#FF9F03]" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Perpanjang Otomatis (Auto-Renew)
                        </span>
                        <p className="text-[10px] text-slate-500">Tandai jika tagihan otomatis ditarik dari kartu kredit.</p>
                      </div>
                    </label>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Catatan / Informasi Login (Opsional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Terdaftar pakai email studio@sulo.dev..."
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
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
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
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
                Aset Berhasil Didaftarkan!
              </h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Aset infrastruktur telah tersimpan dan jadwal perpanjangan akan dipantau oleh sistem.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}