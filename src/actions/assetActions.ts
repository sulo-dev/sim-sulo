"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- HELPER FUNCTION ---
const cleanString = (val: any) => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

// ==============================================
// 1. TAMBAH ASET BARU
// ==============================================
export async function createAsset(data: any) {
  try {
    const assetCode = cleanString(data.assetCode);
    const name = cleanString(data.name);
    const category = cleanString(data.category);
    const purchaseDate = cleanString(data.purchaseDate) || null;
    const price = data.price ? parseFloat(data.price.replace(/[^0-9]/g, '')) : 0;
    const condition = cleanString(data.condition) || 'Good';
    const status = cleanString(data.status) || 'Available';
    const assignedTo = cleanString(data.assignedTo) || null;
    const notes = cleanString(data.notes);

    if (!assetCode || !name) throw new Error("Kode Aset dan Nama Aset wajib diisi.");

    await sql`
      INSERT INTO company_assets (
        asset_code, name, category, purchase_date, price, condition, status, assigned_to, notes
      ) VALUES (
        ${assetCode}, ${name}, ${category}, ${purchaseDate}, ${price}, ${condition}, ${status}, ${assignedTo}, ${notes}
      )
    `;

    revalidatePath("/assets");
    return { success: true };
  } catch (error: any) {
    console.error("[ASSET_ERROR] Create:", error);
    // Cek jika Kode Aset duplikat
    if (error.message.includes('unique constraint')) {
      return { success: false, message: "Kode Aset sudah digunakan, gunakan kode lain." };
    }
    return { success: false, message: error.message };
  }
}

// ==============================================
// 2. EDIT ASET
// ==============================================
export async function updateAsset(data: any) {
  try {
    const id = Number(data.id);
    const assetCode = cleanString(data.assetCode);
    const name = cleanString(data.name);
    const category = cleanString(data.category);
    const purchaseDate = cleanString(data.purchaseDate) || null;
    const price = data.price ? parseFloat(data.price.replace(/[^0-9]/g, '')) : 0;
    const condition = cleanString(data.condition) || 'Good';
    const status = cleanString(data.status) || 'Available';
    const assignedTo = cleanString(data.assignedTo) || null;
    const notes = cleanString(data.notes);

    await sql`
      UPDATE company_assets
      SET 
        asset_code = ${assetCode},
        name = ${name},
        category = ${category},
        purchase_date = ${purchaseDate},
        price = ${price},
        condition = ${condition},
        status = ${status},
        assigned_to = ${assignedTo},
        notes = ${notes}
      WHERE id = ${id}
    `;

    revalidatePath("/assets");
    return { success: true };
  } catch (error: any) {
    console.error("[ASSET_ERROR] Update:", error);
    if (error.message.includes('unique constraint')) {
      return { success: false, message: "Kode Aset sudah digunakan oleh aset lain." };
    }
    return { success: false, message: error.message };
  }
}

// ==============================================
// 3. HAPUS ASET
// ==============================================
export async function deleteAsset(id: number) {
  try {
    await sql`DELETE FROM company_assets WHERE id = ${id}`;
    revalidatePath("/assets");
    return { success: true };
  } catch (error: any) {
    console.error("[ASSET_ERROR] Delete:", error);
    return { success: false, message: error.message };
  }
}