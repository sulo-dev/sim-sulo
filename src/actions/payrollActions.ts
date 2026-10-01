"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

const cleanString = (val: any) => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

// ==============================================
// 1. CATAT PAYROLL / HONOR BARU
// ==============================================
export async function createPayroll(data: any) {
  try {
    const userId = cleanString(data.userId);
    const type = cleanString(data.type) || 'Gaji Pokok';
    const paymentDate = cleanString(data.paymentDate) || null;
    const status = cleanString(data.status) || 'Unpaid';
    const notes = cleanString(data.notes);
    
    // Konversi string Rupiah ke angka murni
    const amount = data.amount ? parseFloat(data.amount.replace(/[^0-9]/g, '')) : 0;
    
    // Website ID opsional (hanya jika jenisnya Bonus/Bagi Hasil Proyek)
    const websiteId = data.websiteId ? Number(data.websiteId) : null;

    if (!userId || amount <= 0) {
      throw new Error("Anggota tim dan nominal uang wajib diisi dengan benar.");
    }

    await sql`
      INSERT INTO payrolls (
        user_id, website_id, type, amount, payment_date, status, notes
      ) VALUES (
        ${userId}, ${websiteId}, ${type}, ${amount}, ${paymentDate}, ${status}, ${notes}
      )
    `;

    revalidatePath("/payroll");
    return { success: true };
  } catch (error: any) {
    console.error("[PAYROLL_ERROR] Create:", error);
    return { success: false, message: error.message };
  }
}

// ==============================================
// 2. EDIT / UPDATE PAYROLL
// ==============================================
export async function updatePayroll(data: any) {
  try {
    const id = Number(data.id);
    const userId = cleanString(data.userId);
    const type = cleanString(data.type) || 'Gaji Pokok';
    const paymentDate = cleanString(data.paymentDate) || null;
    const status = cleanString(data.status) || 'Unpaid';
    const notes = cleanString(data.notes);
    
    const amount = data.amount ? parseFloat(data.amount.replace(/[^0-9]/g, '')) : 0;
    const websiteId = data.websiteId ? Number(data.websiteId) : null;

    await sql`
      UPDATE payrolls
      SET 
        user_id = ${userId},
        website_id = ${websiteId},
        type = ${type},
        amount = ${amount},
        payment_date = ${paymentDate},
        status = ${status},
        notes = ${notes}
      WHERE id = ${id}
    `;

    revalidatePath("/payroll");
    return { success: true };
  } catch (error: any) {
    console.error("[PAYROLL_ERROR] Update:", error);
    return { success: false, message: error.message };
  }
}

// ==============================================
// 3. HAPUS PAYROLL
// ==============================================
export async function deletePayroll(id: number) {
  try {
    await sql`DELETE FROM payrolls WHERE id = ${id}`;
    revalidatePath("/payroll");
    return { success: true };
  } catch (error: any) {
    console.error("[PAYROLL_ERROR] Delete:", error);
    return { success: false, message: error.message };
  }
}