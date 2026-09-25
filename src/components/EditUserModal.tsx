"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

export default function EditUserModal({ isOpen, onClose, data, onSuccess, showToast }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(data.status);
  const [isOnLeave, setIsOnLeave] = useState(data.isOnLeave);
  const [phone, setPhone] = useState(data.phone || "");

  // Update local state ketika prop data (dari parent) berubah/modal terbuka kembali
  useEffect(() => {
    if (isOpen) {
      setStatus(data.status);
      setIsOnLeave(data.isOnLeave);
      setPhone(data.phone || "");
    }
  }, [isOpen, data]);

  // Fungsi membatasi input nomor WA hanya angka murni
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setPhone(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // 1. Bersihkan input dari spasi berlebih
    const nameInput = (formData.get("name") as string).trim();
    const roleInput = (formData.get("role") as string).trim();
    const emailInput = (formData.get("email") as string).trim();

    // 2. Validasi Anti Spasi Kosong
    if (!nameInput) {
      showToast("Nama karyawan wajib diisi dan tidak boleh hanya spasi!", "error");
      setIsLoading(false);
      return;
    }

    if (!roleInput) {
      showToast("Posisi/Role wajib diisi dan tidak boleh hanya spasi!", "error");
      setIsLoading(false);
      return;
    }

    // 3. Validasi Keamanan Nomor Telepon Khusus (WA) - (Boleh kosong, tapi jika diisi wajib 10-14 digit angka)
    if (phone.length > 0 && (phone.length < 10 || phone.length > 14)) {
      showToast("Jika diisi, No WhatsApp harus antara 10 hingga 14 digit angka!", "error");
      setIsLoading(false);
      return;
    }

    // 4. Data siap dikirim
    const updatedData = {
      name: nameInput,
      email: emailInput,
      role: roleInput,
      phone: phone, // Memakai nilai dari state 'phone' yang hanya membolehkan angka
      status: status,
      annual_leave_quota: Number(formData.get("annual_leave_quota")),
      is_on_leave: isOnLeave,
    };

    const res = await updateUser(data.id, updatedData);
    setIsLoading(false);

    if (res.success) {
      showToast("Data karyawan berhasil diperbarui.", "success");
      onSuccess();
      onClose();
    } else {
      showToast(res.message || "Terjadi kesalahan.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Karyawan</h3>
            <p className="text-xs text-slate-500 mt-1">ID Karyawan: <span className="font-mono font-bold text-[#011D58] dark:text-[#FF9F03]">{data.id}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSubmit} id="editUserForm" className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Nama Lengkap *</label>
                <input name="name" type="text" required defaultValue={data.name} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:border-[#FC7A0B] transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Email Karyawan *</label>
                <input name="email" type="email" required defaultValue={data.email} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:border-[#FC7A0B] transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Posisi / Role *</label>
                <input name="role" type="text" required defaultValue={data.role} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:border-[#FC7A0B] transition-colors" />
              </div>
              
              {/* INPUT NOMOR TELEPON */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">No WhatsApp</label>
                <input 
                  name="phone" 
                  type="tel" 
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="0812xxxxxx" 
                  maxLength={14} 
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:border-[#FC7A0B] transition-colors" 
                />
                <p className="text-[10px] text-slate-500 mt-1">Hanya angka. Minimal 10 digit, maksimal 14 digit.</p>
              </div>
              
              <div className="sm:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-4">Pengaturan Status & Kehadiran</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Status Akun *</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:border-[#FC7A0B] cursor-pointer transition-colors">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Sisa Cuti *</label>
                    <input name="annual_leave_quota" type="number" min={0} required defaultValue={data.annualLeaveQuota} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:border-[#FC7A0B] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Sedang Cuti?</label>
                    <select value={isOnLeave ? "true" : "false"} onChange={(e) => setIsOnLeave(e.target.value === "true")} className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-sm rounded-xl p-3 outline-none focus:border-[#FC7A0B] cursor-pointer transition-colors">
                      <option value="false">Tidak (Hadir)</option>
                      <option value="true">Ya (Cuti)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-bold rounded-xl transition-colors">Batal</button>
          <button type="submit" form="editUserForm" disabled={isLoading} className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-[#011D58]/20 disabled:opacity-70">
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}