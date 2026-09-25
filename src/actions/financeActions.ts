// src/actions/financeActions.ts
"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. FUNGSI TAMBAH DATA KEUANGAN / TAGIHAN
export async function createFinance(data: {
  websiteId: number;
  billingCycle: string;
  revenue: number;
  infrastructureCost: number;
  costBreakdown: any; // Bisa berupa array/object rincian biaya
  nextBilling: string;
  status: string;
}) {
  try {
    // Ubah object JS menjadi string JSON agar aman dimasukkan ke kolom JSONB
    const breakdownJson = JSON.stringify(data.costBreakdown || []);

    await sql`
      INSERT INTO finances (
        website_id, billing_cycle, revenue, infrastructure_cost, 
        cost_breakdown, next_billing, status
      )
      VALUES (
        ${data.websiteId}, ${data.billingCycle}, ${data.revenue}, ${data.infrastructureCost}, 
        ${breakdownJson}::jsonb, ${data.nextBilling}, ${data.status}
      )
    `;

    revalidatePath("/finances"); // Sesuaikan dengan route halaman keuangan Anda
    return { success: true, message: "Data keuangan berhasil ditambahkan." };
  } catch (error: any) {
    console.error("Error createFinance:", error);
    return { success: false, message: error.message || "Gagal menambah data keuangan." };
  }
}

// 2. FUNGSI EDIT DATA KEUANGAN
export async function updateFinance(
  id: number | string,
  data: {
    websiteId: number;
    billingCycle: string;
    revenue: number;
    infrastructureCost: number;
    costBreakdown: any;
    nextBilling: string;
    status: string;
  }
) {
  try {
    const breakdownJson = JSON.stringify(data.costBreakdown || []);

    await sql`
      UPDATE finances
      SET 
        website_id = ${data.websiteId},
        billing_cycle = ${data.billingCycle},
        revenue = ${data.revenue},
        infrastructure_cost = ${data.infrastructureCost},
        cost_breakdown = ${breakdownJson}::jsonb,
        next_billing = ${data.nextBilling},
        status = ${data.status}
      WHERE id = ${id}
    `;

    revalidatePath("/finances");
    return { success: true, message: "Data keuangan berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updateFinance:", error);
    return { success: false, message: error.message || "Gagal memperbarui data keuangan." };
  }
}

// 3. FUNGSI HAPUS DATA KEUANGAN
export async function deleteFinance(id: number | string) {
  try {
    await sql`DELETE FROM finances WHERE id = ${id}`;
    revalidatePath("/finances");
    return { success: true, message: "Data keuangan berhasil dihapus." };
  } catch (error: any) {
    console.error("Error deleteFinance:", error);
    return { success: false, message: error.message || "Gagal menghapus data keuangan." };
  }
}