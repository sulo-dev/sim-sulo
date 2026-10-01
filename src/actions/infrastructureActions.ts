"use server";

import { sql } from "@/lib/db"; 
import { revalidatePath } from "next/cache";

// --- HELPER FUNCTIONS (Gatekeepers) ---

// 1. Membersihkan input harga. 
// Jika Frontend mengirim "Rp 1.500.000" atau "1.500.000", fungsi ini akan menyisakan "1500000" agar aman masuk ke DB DECIMAL
const cleanNumber = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.toString().replace(/[^0-9.-]+/g, ""); // Hanya sisakan angka, minus, dan titik desimal
  return parseFloat(cleaned) || 0;
};

// 2. Membersihkan input tanggal.
// PostgreSQL tipe DATE akan error jika menerima string kosong "". Kita ubah menjadi NULL.
const cleanDate = (val: any) => {
  if (!val || val.trim() === "") return null;
  return val;
};

// ==============================================
// 1. TAMBAH ASET INFRASTRUKTUR
// ==============================================
export async function createInfrastructure(data: any) {
  try {
    // Sanitasi data sebelum masuk ke Database
    const renewalPrice = cleanNumber(data.renewalPrice);
    const purchaseDate = cleanDate(data.purchaseDate);
    const expiryDate = cleanDate(data.expiry);
    const autoRenew = data.autoRenew === true || data.autoRenew === 'true'; // Konversi aman ke Boolean
    const notes = data.notes || null;
    const status = data.status || 'Active'; // Default ke Active jika kosong

    await sql`
      INSERT INTO infrastructures (
        website_id, type, provider, asset, expiry, status, purchase_date, renewal_price, billing_cycle, auto_renew, notes
      ) VALUES (
        ${data.websiteId}, ${data.type}, ${data.provider}, ${data.asset}, 
        ${expiryDate}, ${status}, ${purchaseDate}, ${renewalPrice}, ${data.billingCycle}, ${autoRenew}, ${notes}
      )
    `;

    // Revalidasi agar UI Dashboard dan Detail Website langsung terupdate
    revalidatePath("/infrastructures");
    if (data.websiteId) revalidatePath(`/websites/${data.websiteId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[DB_ERROR] GAGAL SIMPAN INFRA:", error);
    return { success: false, message: error.message };
  }
}

// ==============================================
// 2. EDIT / UPDATE ASET INFRASTRUKTUR
// ==============================================
export async function updateInfrastructure(id: number | string, data: any) {
  try {
    // Sanitasi data sebelum masuk ke Database
    const renewalPrice = cleanNumber(data.renewalPrice);
    const purchaseDate = cleanDate(data.purchaseDate);
    const expiryDate = cleanDate(data.expiry);
    const autoRenew = data.autoRenew === true || data.autoRenew === 'true';
    const notes = data.notes || null;
    const status = data.status || 'Active';

    await sql`
      UPDATE infrastructures
      SET 
        website_id = ${data.websiteId},
        type = ${data.type},
        provider = ${data.provider},
        asset = ${data.asset},
        expiry = ${expiryDate},
        status = ${status},
        purchase_date = ${purchaseDate},
        renewal_price = ${renewalPrice},
        billing_cycle = ${data.billingCycle},
        auto_renew = ${autoRenew},
        notes = ${notes}
      WHERE id = ${id}
    `;

    revalidatePath("/infrastructures");
    if (data.websiteId) revalidatePath(`/websites/${data.websiteId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[DB_ERROR] GAGAL EDIT INFRA:", error);
    return { success: false, message: error.message };
  }
}

// ==============================================
// 3. HAPUS ASET INFRASTRUKTUR
// ==============================================
export async function deleteInfrastructure(id: number | string, websiteId?: number | string) {
  try {
    await sql`DELETE FROM infrastructures WHERE id = ${id}`;
    
    revalidatePath("/infrastructures");
    if (websiteId) revalidatePath(`/websites/${websiteId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[DB_ERROR] GAGAL HAPUS INFRA:", error);
    return { success: false, message: error.message };
  }
}