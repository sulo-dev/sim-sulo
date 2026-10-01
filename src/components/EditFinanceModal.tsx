"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateFinance } from "@/actions/financeActions";

type WebsiteDropdown = { id: number; name: string; clientName: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Data Finance yang mau diedit
  websites: WebsiteDropdown[];
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error") => void;
};

type FieldKey = "websiteId" | "status" | "revenue" | "nextBilling" | "billingCycle" | "breakdown";

export default function EditFinanceModal({
  isOpen,
  onClose,
  data,
  websites,
  onSuccess,
  showToast,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // State Form Input
  const [websiteId, setWebsiteId] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [revenue, setRevenue] = useState("");
  const [nextBilling, setNextBilling] = useState("");
  const [status, setStatus] = useState("");

  // State Dynamic Cost Breakdown Array
  const [breakdown, setBreakdown] = useState<{ keterangan: string; nominal: string }[]>([]);

  // State Penanganan Validasi Inline 1 per 1
  const [fieldError, setFieldError] = useState<{
    field: FieldKey | null;
    message: string | null;
  }>({
    field: null,
    message: null,
  });

  // FUNGSI UTILITY: Mengubah angka menjadi format Rupiah (misal: 1500000 -> 1.500.000)
  const formatRupiah = (val: string | number) => {
    const numericValue = String(val).replace(/[^0-9]/g, "");
    if (!numericValue) return "";
    return new Intl.NumberFormat("id-ID").format(Number(numericValue));
  };

  useEffect(() => {
    if (isOpen && data) {
      setWebsiteId(data.websiteId?.toString() || "");
      setBillingCycle(data.billingCycle || "Bulanan");
      setRevenue(formatRupiah(data.revenue || 0));
      setNextBilling(data.nextBilling || "");
      setStatus(data.status || "Unpaid");
      setFieldError({ field: null, message: null });

      // Map data cost breakdown lama agar sesuai format form
      if (data.costBreakdown && data.costBreakdown.length > 0) {
        setBreakdown(
          data.costBreakdown.map((item: any) => ({
            keterangan: item.keterangan || item.item || "",
            nominal: formatRupiah(item.nominal || item.amount || 0),
          }))
        );
      } else {
        setBreakdown([{ keterangan: "", nominal: "" }]);
      }
    }
  }, [isOpen, data]);

  const clearFieldError = (fieldName: FieldKey) => {
    if (fieldError.field === fieldName) {
      setFieldError({ field: null, message: null });
    }
  };

  // Total HPP dihitung otomatis
  const totalCost = breakdown.reduce((acc, curr) => {
    const cleanNum = Number(curr.nominal.replace(/[^0-9]/g, "")) || 0;
    return acc + cleanNum;
  }, 0);

  const handleBreakdownChange = (index: number, field: "keterangan" | "nominal", value: string) => {
    clearFieldError("breakdown");
    const newBreakdown = [...breakdown];
    if (field === "nominal") {
      newBreakdown[index][field] = formatRupiah(value);
    } else {
      newBreakdown[index][field] = value;
    }
    setBreakdown(newBreakdown);
  };

  const addBreakdownRow = () => {
    clearFieldError("breakdown");
    setBreakdown([...breakdown, { keterangan: "", nominal: "" }]);
  };

  const removeBreakdownRow = (index: number) => {
    clearFieldError("breakdown");
    setBreakdown(breakdown.filter((_, i) => i !== index));
  };

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    fieldName: FieldKey
  ) => {
    clearFieldError(fieldName);
    setter(formatRupiah(e.target.value));
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

    // 2. Validasi Status Tagihan
    if (!status) {
      setFieldError({
        field: "status",
        message: "Silakan pilih status tagihan!",
      });
      return;
    }

    // 3. Validasi Nilai Tagihan (Pendapatan)
    if (!revenue || revenue === "0") {
      setFieldError({
        field: "revenue",
        message: "Nilai tagihan (pendapatan) wajib diisi!",
      });
      return;
    }

    // 4. Validasi Tanggal Jatuh Tempo
    if (!nextBilling) {
      setFieldError({
        field: "nextBilling",
        message: "Tanggal jatuh tempo berikutnya wajib diisi!",
      });
      return;
    }

    // 5. Validasi Siklus Penagihan
    if (!billingCycle) {
      setFieldError({
        field: "billingCycle",
        message: "Silakan pilih siklus penagihan!",
      });
      return;
    }

    // 6. Validasi Kelengkapan Baris Rincian Beban
    const invalidBreakdown = breakdown.some((b) => {
      const cleanNominal = Number(b.nominal.replace(/[^0-9]/g, "")) || 0;
      return cleanNominal > 0 && !b.keterangan.trim();
    });

    if (invalidBreakdown) {
      setFieldError({
        field: "breakdown",
        message: "Keterangan beban wajib diisi jika nominal lebih dari 0!",
      });
      return;
    }

    // Proses Pengiriman Data
    setIsLoading(true);

    const cleanRevenue = Number(revenue.replace(/[^0-9]/g, "")) || 0;

    const formattedBreakdown = breakdown
      .map((b) => ({
        keterangan: b.keterangan.trim(),
        nominal: Number(b.nominal.replace(/[^0-9]/g, "")) || 0,
      }))
      .filter((b) => b.keterangan !== "" && b.nominal > 0);

    const financeData = {
      websiteId: Number(websiteId),
      billingCycle,
      revenue: cleanRevenue,
      infrastructureCost: totalCost,
      costBreakdown: formattedBreakdown,
      nextBilling,
      status,
    };

    const res = await updateFinance(data.id, financeData);
    setIsLoading(false);

    if (res.success) {
      showToast("Data keuangan berhasil diperbarui!", "success");
      onSuccess();
      onClose();
    } else {
      const errMsg = res.message || "Gagal memperbarui data keuangan.";
      setFieldError({
        field: "websiteId",
        message: errMsg,
      });
      showToast(errMsg, "error");
    }
  };

  // Helper kelas CSS untuk input/select (normal vs error)
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

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isLoading ? onClose : undefined}
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
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Data Tagihan</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">INV-{data.id.toString().padStart(3, "0")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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
            
            {/* Field 1 & 2: Proyek & Status */}
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
                  Status <span className="text-rose-500">*</span>
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

            {/* Field 3 & 4 & 5: Nilai Tagihan, Jatuh Tempo, dan Siklus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Nilai Tagihan (Pendapatan) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
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

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Jatuh Tempo Berikutnya <span className="text-rose-500">*</span>
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

                <div className="w-1/3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Siklus
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => {
                      setBillingCycle(e.target.value);
                      clearFieldError("billingCycle");
                    }}
                    className={`${getInputClasses("billingCycle")} cursor-pointer`}
                  >
                    <option value="Bulanan">Bulan</option>
                    <option value="Tahunan">Tahun</option>
                    <option value="Sekali">Sekali</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* DYNAMIC COST BREAKDOWN */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Rincian Beban Infrastruktur (HPP)
                </label>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Total: Rp {totalCost.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="space-y-3">
                {breakdown.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <input
                      type="text"
                      value={item.keterangan}
                      onChange={(e) => handleBreakdownChange(index, "keterangan", e.target.value)}
                      placeholder="Nama layanan (Cth: VPS Vultr)"
                      className="flex-1 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] p-3 outline-none transition-colors shadow-sm dark:shadow-none"
                    />
                    <div className="relative w-1/3">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={item.nominal}
                        onChange={(e) => handleBreakdownChange(index, "nominal", e.target.value)}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] block outline-none transition-colors shadow-sm dark:shadow-none"
                      />
                    </div>
                    {breakdown.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBreakdownRow(index)}
                        className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {fieldError.field === "breakdown" && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs font-semibold text-rose-500 mt-2 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {fieldError.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={addBreakdownRow}
                className="mt-3 px-4 py-2 text-xs font-bold text-[#011D58] dark:text-[#FF9F03] bg-[#011D58]/10 dark:bg-[#FF9F03]/10 hover:bg-[#011D58]/20 dark:hover:bg-[#FF9F03]/20 rounded-lg transition-colors"
              >
                + Tambah Baris Beban
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-bold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-[#011D58]/20 transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Menyimpan...
                </>
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