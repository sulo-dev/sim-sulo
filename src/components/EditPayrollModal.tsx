"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updatePayroll } from "@/actions/payrollActions";

type UserDropdown = { id: string; name: string };
type WebsiteDropdown = { id: number; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  users: UserDropdown[];
  websites: WebsiteDropdown[];
  onSuccess: () => void;
  data: any | null;
  showToast?: (message: string, type: "success" | "error") => void;
};

type FieldKey =
  | "userId"
  | "type"
  | "websiteId"
  | "amount"
  | "paymentDate"
  | "status"
  | "notes";

export default function EditPayrollModal({
  isOpen,
  onClose,
  users,
  websites,
  onSuccess,
  data,
  showToast,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  // Form State
  const [userId, setUserId] = useState("");
  const [type, setType] = useState("Gaji Pokok");
  const [websiteId, setWebsiteId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [notes, setNotes] = useState("");

  // State Penanganan Validasi Inline 1 per 1
  const [fieldError, setFieldError] = useState<{
    field: FieldKey | null;
    message: string | null;
  }>({
    field: null,
    message: null,
  });

  // Population Data Awal saat Modal Ditingkatkan
  useEffect(() => {
    if (isOpen && data) {
      setUserId(data.userId || "");
      setType(data.type || "Gaji Pokok");
      setWebsiteId(data.websiteId ? data.websiteId.toString() : "");

      const formattedDate = data.paymentDate ? data.paymentDate.split("T")[0] : "";
      setPaymentDate(formattedDate);

      if (data.amount) {
        const numericValue = String(data.amount).replace(/[^0-9]/g, "");
        if (numericValue) {
          const formatted = new Intl.NumberFormat("id-ID").format(Number(numericValue));
          setAmount(`Rp ${formatted}`);
        } else {
          setAmount("");
        }
      } else {
        setAmount("");
      }

      setStatus(data.status || "Unpaid");
      setNotes(data.notes || "");
      setFieldError({ field: null, message: null });
    }
  }, [isOpen, data]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitStatus("idle");
      setIsLoading(false);
      setFieldError({ field: null, message: null });
    }, 300);
  };

  const clearFieldError = (fieldName: FieldKey) => {
    if (fieldError.field === fieldName) {
      setFieldError({ field: null, message: null });
    }
  };

  // Format Uang Rupiah Otomatis saat mengetik
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    clearFieldError("amount");

    if (inputVal === "" || inputVal === "Rp" || inputVal === "Rp ") {
      setAmount("");
      return;
    }
    const numericValue = inputVal.replace(/[^0-9]/g, "");
    if (numericValue) {
      const formatted = new Intl.NumberFormat("id-ID").format(Number(numericValue));
      setAmount(`Rp ${formatted}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setFieldError({ field: null, message: null });

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    // 1. Validasi Anggota Tim
    if (!userId) {
      setFieldError({
        field: "userId",
        message: "Silakan pilih anggota tim!",
      });
      return;
    }

    // 2. Validasi Jenis Pembayaran
    if (!type) {
      setFieldError({
        field: "type",
        message: "Silakan pilih jenis pembayaran!",
      });
      return;
    }

    // 3. Validasi Proyek Terkait (Kondisional)
    if ((type === "Bonus Proyek" || type === "Bagi Hasil") && !websiteId) {
      setFieldError({
        field: "websiteId",
        message: "Silakan pilih proyek terkait!",
      });
      return;
    }

    // 4. Validasi Nominal
    if (!amount || amount === "Rp " || amount === "Rp 0" || amount === "Rp") {
      setFieldError({
        field: "amount",
        message: "Nominal pembayaran honor wajib diisi!",
      });
      return;
    }

    // 5. Validasi Tanggal Pembayaran
    if (!paymentDate) {
      setFieldError({
        field: "paymentDate",
        message: "Tanggal pembayaran wajib ditentukan!",
      });
      return;
    }

    // 6. Validasi Status Pembayaran
    if (!status) {
      setFieldError({
        field: "status",
        message: "Silakan pilih status pembayaran!",
      });
      return;
    }

    // Proses Pengiriman Data
    setIsLoading(true);

    const payload = {
      id: data.id,
      userId,
      type,
      websiteId: websiteId ? Number(websiteId) : null,
      amount,
      paymentDate,
      status,
      notes: notes.trim(),
    };

    const res = await updatePayroll(payload);

    if (res.success) {
      setSubmitStatus("success");
      if (showToast) showToast("Data payroll berhasil diperbarui!", "success");

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } else {
      setIsLoading(false);
      const errMsg = res.message || "Gagal memperbarui data payroll ke server.";
      setFieldError({
        field: "userId",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Data Payroll</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Perbarui informasi pembayaran honor tim.</p>
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
                  
                  {/* Field 1 & 2: Anggota Tim & Jenis Pembayaran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Anggota Tim <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={userId}
                        onChange={(e) => {
                          setUserId(e.target.value);
                          clearFieldError("userId");
                        }}
                        className={`${getInputClasses("userId")} cursor-pointer`}
                      >
                        <option value="">-- Pilih Anggota Tim --</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      <AnimatePresence>
                        {fieldError.field === "userId" && (
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
                        Jenis Pembayaran <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={type}
                        onChange={(e) => {
                          const val = e.target.value;
                          setType(val);
                          if (val !== "Bonus Proyek" && val !== "Bagi Hasil") {
                            setWebsiteId("");
                          }
                          clearFieldError("type");
                        }}
                        className={`${getInputClasses("type")} cursor-pointer`}
                      >
                        <option value="Gaji Pokok">Gaji Pokok</option>
                        <option value="Bonus Proyek">Bonus Proyek</option>
                        <option value="Bagi Hasil">Bagi Hasil (Profit Sharing)</option>
                        <option value="Tunjangan">Tunjangan Lainnya</option>
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
                  </div>

                  {/* Field 3: Proyek Kondisional */}
                  <AnimatePresence>
                    {(type === "Bonus Proyek" || type === "Bagi Hasil") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 mt-1">
                          Proyek / Klien Terkait <span className="text-rose-500">*</span>
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Field 4 & 5: Nominal & Tanggal Pembayaran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Nominal (Rp) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Rp 0"
                        className={`${getInputClasses("amount")} font-bold text-lg`}
                      />
                      <AnimatePresence>
                        {fieldError.field === "amount" && (
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
                        Tanggal Pembayaran <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => {
                          setPaymentDate(e.target.value);
                          clearFieldError("paymentDate");
                        }}
                        className={`${getInputClasses("paymentDate")} dark:[color-scheme:dark]`}
                      />
                      <AnimatePresence>
                        {fieldError.field === "paymentDate" && (
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

                  {/* Field 6: Status Pembayaran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Status Pembayaran <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={status}
                        onChange={(e) => {
                          setStatus(e.target.value);
                          clearFieldError("status");
                        }}
                        className={`${getInputClasses("status")} cursor-pointer`}
                      >
                        <option value="Unpaid">⏳ Belum Dibayar (Unpaid)</option>
                        <option value="Paid">✅ Sudah Dibayar (Paid)</option>
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

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Catatan / Keterangan (Opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Pembayaran DP bonus fase 1..."
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
                      "Simpan Perubahan"
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
                Payroll Diperbarui!
              </h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Perubahan pada data honor tim berhasil tersimpan ke dalam sistem SULO-MIS.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}