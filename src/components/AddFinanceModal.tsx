"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createFinance } from "@/actions/financeActions";

type WebsiteDropdown = { id: number; name: string; clientName: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteDropdown[];
  onSuccess?: () => void;
  showToast?: (message: string, type: "success" | "error") => void;
};

type FieldKey = "websiteId" | "billingCycle" | "revenue" | "cost" | "nextBilling" | "status";

export default function AddFinanceModal({
  isOpen,
  onClose,
  websites,
  onSuccess,
  showToast,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  // State Form Input
  const [websiteId, setWebsiteId] = useState("");
  const [billingCycle, setBillingCycle] = useState("Bulanan");
  const [revenue, setRevenue] = useState("");
  const [cost, setCost] = useState("");
  const [nextBilling, setNextBilling] = useState("");
  const [status, setStatus] = useState("Unpaid");

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
      setWebsiteId("");
      setBillingCycle("Bulanan");
      setRevenue("");
      setCost("");
      setNextBilling("");
      setStatus("Unpaid");
      setFieldError({ field: null, message: null });
    }, 300);
  };

  const clearFieldError = (fieldName: FieldKey) => {
    if (fieldError.field === fieldName) {
      setFieldError({ field: null, message: null });
    }
  };

  // Otomatis memformat input dengan pemisah ribuan (1.500.000)
  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    fieldName: FieldKey
  ) => {
    const inputVal = e.target.value;
    clearFieldError(fieldName);

    const numericValue = inputVal.replace(/[^0-9]/g, "");

    if (!numericValue) {
      setter("");
      return;
    }

    const formatted = new Intl.NumberFormat("id-ID").format(Number(numericValue));
    setter(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError({ field: null, message: null });

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    // 1. Validasi Proyek & Klien
    if (!websiteId) {
      setFieldError({
        field: "websiteId",
        message: "Silakan pilih proyek / klien terlebih dahulu!",
      });
      return;
    }

    // 2. Validasi Siklus Penagihan
    if (!billingCycle) {
      setFieldError({
        field: "billingCycle",
        message: "Silakan pilih siklus penagihan!",
      });
      return;
    }

    // 3. Validasi Nilai Tagihan (Revenue)
    if (!revenue || revenue === "0") {
      setFieldError({
        field: "revenue",
        message: "Nilai tagihan (pendapatan) wajib diisi!",
      });
      return;
    }

    // 4. Validasi Beban Internal (Cost)
    if (cost === "") {
      setFieldError({
        field: "cost",
        message: "Beban internal (HPP) wajib diisi! Isi 0 jika tidak ada beban.",
      });
      return;
    }

    // 5. Validasi Tanggal Penagihan Berikutnya
    if (!nextBilling) {
      setFieldError({
        field: "nextBilling",
        message: "Tanggal penagihan berikutnya wajib ditentukan!",
      });
      return;
    }

    // 6. Validasi Status Awal
    if (!status) {
      setFieldError({
        field: "status",
        message: "Silakan pilih status awal tagihan!",
      });
      return;
    }

    // Proses Pengiriman Data
    setIsLoading(true);

    const cleanRevenue = Number(revenue.replace(/[^0-9]/g, "")) || 0;
    const cleanCost = Number(cost.replace(/[^0-9]/g, "")) || 0;

    const breakdownData = [
      {
        keterangan: "Beban Internal Default",
        nominal: cleanCost,
      },
    ];

    const financeData = {
      websiteId: Number(websiteId),
      billingCycle: billingCycle,
      revenue: cleanRevenue,
      infrastructureCost: cleanCost,
      costBreakdown: breakdownData,
      nextBilling: nextBilling,
      status: status,
    };

    const res = await createFinance(financeData);

    if (res.success) {
      setSubmitStatus("success");
      if (showToast) showToast("Data tagihan / keuangan berhasil ditambahkan!", "success");

      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setIsLoading(false);
      const errMsg = res.message || "Gagal menyimpan tagihan ke database server.";
      setFieldError({
        field: "websiteId",
        message: errMsg,
      });
      if (showToast) showToast(errMsg, "error");
    }
  };

  // Helper kelas CSS untuk input/select
  const getInputClasses = (fieldName: FieldKey) => {
    const base =
      "w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none ";
    if (fieldError.field === fieldName) {
      return (
        base + "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
      );
    }
    return (
      base + "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
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
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <AnimatePresence mode="wait">
          {submitStatus === "idle" && (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Buat Invoice Baru</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Catat tagihan klien dan rincian beban proyek.</p>
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
              <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 space-y-5">
                  {/* Field 1 & 2: Proyek & Siklus */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Proyek & Klien <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={websiteId}
                        onChange={(e) => {
                          setWebsiteId(e.target.value);
                          clearFieldError("websiteId");
                        }}
                        className={`${getInputClasses("websiteId")} cursor-pointer`}
                      >
                        <option value="">-- Pilih Proyek --</option>
                        {websites.map((web) => (
                          <option key={web.id} value={web.id}>
                            {web.name} ({web.clientName})
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
                        Siklus Penagihan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={billingCycle}
                        onChange={(e) => {
                          setBillingCycle(e.target.value);
                          clearFieldError("billingCycle");
                        }}
                        className={`${getInputClasses("billingCycle")} cursor-pointer`}
                      >
                        <option value="Bulanan">Bulanan (Monthly)</option>
                        <option value="Tahunan">Tahunan (Annually)</option>
                        <option value="Sekali">Sekali Bayar (One-time)</option>
                      </select>
                      <AnimatePresence>
                        {fieldError.field === "billingCycle" && (
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

                  {/* Field 3 & 4: Nilai Tagihan & Beban Internal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Nilai Tagihan (Pendapatan) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={revenue}
                          onChange={(e) => handleCurrencyChange(e, setRevenue, "revenue")}
                          placeholder="0"
                          className={`pl-9 pr-3 py-3 ${getInputClasses("revenue")} font-bold`}
                        />
                      </div>
                      <AnimatePresence>
                        {fieldError.field === "revenue" && (
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
                        Beban Internal (HPP) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cost}
                          onChange={(e) => handleCurrencyChange(e, setCost, "cost")}
                          placeholder="0"
                          className={`pl-9 pr-3 py-3 ${getInputClasses("cost")} font-bold`}
                        />
                      </div>
                      <AnimatePresence>
                        {fieldError.field === "cost" && (
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

                  {/* Field 5 & 6: Tgl Penagihan & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Tgl. Penagihan Berikutnya <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={nextBilling}
                        onChange={(e) => {
                          setNextBilling(e.target.value);
                          clearFieldError("nextBilling");
                        }}
                        className={`${getInputClasses("nextBilling")} dark:[color-scheme:dark]`}
                      />
                      <AnimatePresence>
                        {fieldError.field === "nextBilling" && (
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
                        Status Awal <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={status}
                        onChange={(e) => {
                          setStatus(e.target.value);
                          clearFieldError("status");
                        }}
                        className={`${getInputClasses("status")} cursor-pointer`}
                      >
                        <option value="Unpaid">Belum Lunas (Unpaid)</option>
                        <option value="Paid">Lunas (Paid)</option>
                        <option value="Internal">Internal (Tanpa Tagihan)</option>
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
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3">
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
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Tagihan"
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
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">Invoice Dibuat!</h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Data tagihan dan rincian keuangan proyek berhasil tersimpan ke dalam sistem SULO-MIS.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}