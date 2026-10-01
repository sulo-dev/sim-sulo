"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUser } from "@/actions/userActions";

type UserData = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
  annualLeaveQuota: number;
  isOnLeave: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: UserData;
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error") => void;
};

type FieldKey =
  | "name"
  | "email"
  | "role"
  | "phone"
  | "status"
  | "annualLeaveQuota"
  | "isOnLeave";

export default function EditUserModal({
  isOpen,
  onClose,
  data,
  onSuccess,
  showToast,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  // Controlled Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [annualLeaveQuota, setAnnualLeaveQuota] = useState<number | "">(12);
  const [isOnLeave, setIsOnLeave] = useState(false);

  // State Penanganan Validasi Inline
  const [fieldError, setFieldError] = useState<{
    field: FieldKey | null;
    message: string | null;
  }>({
    field: null,
    message: null,
  });

  // Sinkronisasi data dari parent prop saat modal terbuka
  useEffect(() => {
    if (isOpen && data) {
      setName(data.name || "");
      setEmail(data.email || "");
      setRole(data.role || "");
      setPhone(data.phone || "");
      setStatus(data.status || "Active");
      setAnnualLeaveQuota(data.annualLeaveQuota ?? 12);
      setIsOnLeave(!!data.isOnLeave);
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

  // Filter input nomor WhatsApp murni angka
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setPhone(numericValue);
    clearFieldError("phone");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldError({ field: null, message: null });

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedRole = role.trim();

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    if (!trimmedName) {
      setFieldError({ field: "name", message: "Nama karyawan wajib diisi!" });
      return;
    }

    if (!trimmedEmail) {
      setFieldError({ field: "email", message: "Email karyawan wajib diisi!" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFieldError({ field: "email", message: "Format email tidak valid!" });
      return;
    }

    if (!trimmedRole) {
      setFieldError({ field: "role", message: "Posisi / Role wajib diisi!" });
      return;
    }

    if (phone.length > 0 && (phone.length < 10 || phone.length > 14)) {
      setFieldError({
        field: "phone",
        message: "Nomor WhatsApp harus 10-14 digit!",
      });
      return;
    }

    if (annualLeaveQuota === "" || Number(annualLeaveQuota) < 0) {
      setFieldError({
        field: "annualLeaveQuota",
        message: "Kuota cuti tidak boleh kosong atau negatif!",
      });
      return;
    }

    // Proses Pengiriman Data
    setIsLoading(true);

    const updatedData = {
      name: trimmedName,
      email: trimmedEmail,
      role: trimmedRole,
      phone: phone,
      status: status,
      annual_leave_quota: Number(annualLeaveQuota),
      is_on_leave: isOnLeave,
    };

    const res = await updateUser(data.id, updatedData);

    if (res.success) {
      setSubmitStatus("success");
      showToast("Data karyawan berhasil diperbarui.", "success");

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } else {
      setIsLoading(false);
      const errMsg = res.message || "Gagal memperbarui data karyawan.";
      setFieldError({ field: "name", message: errMsg });
      showToast(errMsg, "error");
    }
  };

  // Helper kelas CSS untuk input/select dengan padding kiri (pl-11) untuk icon
  const getInputClasses = (fieldName: FieldKey) => {
    const base =
      "w-full text-xs rounded-xl block pl-11 pr-4 py-3.5 outline-none transition-all shadow-sm dark:shadow-none ";
    if (fieldError.field === fieldName) {
      return (
        base +
        "bg-rose-50/50 dark:bg-rose-500/10 border border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20 text-slate-900 dark:text-slate-100"
      );
    }
    return (
      base +
      "bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/50 focus:border-[#FC7A0B] text-slate-900 dark:text-slate-100"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop Glassmorphism */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={
          submitStatus === "idle" && !isLoading ? handleClose : undefined
        }
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
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
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-[#FF9F03] dark:to-[#FA4D09] rounded-2xl flex items-center justify-center shadow-lg shadow-[#011D58]/20 dark:shadow-[#FA4D09]/20 text-white shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Edit Karyawan
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
                      ID Sistem:{" "}
                      <span className="font-mono font-bold text-[#FC7A0B] bg-[#FC7A0B]/10 px-1.5 py-0.5 rounded">
                        {data.id}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex-1 flex flex-col overflow-hidden bg-slate-50/30 dark:bg-slate-950/20"
              >
                <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                  {/* Field 1 & 2: Nama & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Nama Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            clearFieldError("name");
                          }}
                          placeholder="Ahmad Rizky"
                          className={getInputClasses("name")}
                        />
                      </div>
                      <AnimatePresence>
                        {fieldError.field === "name" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Email Karyawan <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearFieldError("email");
                          }}
                          placeholder="email@sulo.dev"
                          className={getInputClasses("email")}
                        />
                      </div>
                      <AnimatePresence>
                        {fieldError.field === "email" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Field 3 & 4: Role & No WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Posisi / Role <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => {
                            setRole(e.target.value);
                            clearFieldError("role");
                          }}
                          placeholder="Frontend Developer"
                          className={getInputClasses("role")}
                        />
                      </div>
                      <AnimatePresence>
                        {fieldError.field === "role" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        No WhatsApp <span className="text-slate-400 normal-case tracking-normal text-[10px]">(Opsional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="0812xxxxxx"
                          maxLength={14}
                          className={getInputClasses("phone")}
                        />
                      </div>
                      <AnimatePresence>
                        {fieldError.field === "phone" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Section Status & Kehadiran */}
                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                      Pengaturan Status & Kehadiran
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* Status Akun */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          Status Akun <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <select
                            value={status}
                            onChange={(e) => {
                              setStatus(e.target.value);
                              clearFieldError("status");
                            }}
                            className={`${getInputClasses("status")} cursor-pointer`}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      {/* Sisa Cuti */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          Sisa Cuti <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.5 9a2.5 2.5 0 00-5 0v3h5V9zM10 12H8v-3a4 4 0 118 0v3h-2M4 19h16v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2z" />
                            </svg>
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={annualLeaveQuota}
                            onChange={(e) => {
                              setAnnualLeaveQuota(
                                e.target.value === "" ? "" : Number(e.target.value)
                              );
                              clearFieldError("annualLeaveQuota");
                            }}
                            className={getInputClasses("annualLeaveQuota")}
                          />
                        </div>
                        <AnimatePresence>
                          {fieldError.field === "annualLeaveQuota" && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {fieldError.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Sedang Cuti? */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          Sedang Cuti?
                        </label>
                        <div className="relative">
                          <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isOnLeave ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </span>
                          <select
                            value={isOnLeave ? "true" : "false"}
                            onChange={(e) => {
                              setIsOnLeave(e.target.value === "true");
                              clearFieldError("isOnLeave");
                            }}
                            className={`w-full text-xs rounded-xl block pl-11 pr-4 py-3.5 outline-none transition-all shadow-sm cursor-pointer ${
                              isOnLeave 
                                ? "bg-amber-50/80 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 focus:ring-2 focus:ring-amber-500/30" 
                                : "bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#FC7A0B]/50"
                            }`}
                          >
                            <option value="false">Tidak (Hadir)</option>
                            <option value="true">Ya (Sedang Cuti)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 dark:bg-gradient-to-r dark:from-[#FF9F03] dark:to-[#FA4D09] dark:hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#011D58]/20 dark:shadow-[#FA4D09]/20 flex items-center gap-2 disabled:opacity-70 cursor-pointer active:scale-95"
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
              transition={{ duration: 0.4, type: "spring", bounce: 0.5 }}
              className="p-10 flex flex-col items-center justify-center text-center min-h-[420px] relative overflow-hidden bg-white dark:bg-slate-900"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                className="relative z-10 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 border border-emerald-300 dark:border-emerald-500/50"
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                Data Diperbarui!
              </h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
                Perubahan pada data anggota tim berhasil disimpan secara permanen ke dalam sistem SULO-MIS.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}