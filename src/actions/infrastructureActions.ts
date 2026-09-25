"use server";

import { sql } from "@/lib/db"; 
import { revalidatePath } from "next/cache";

// 1. TAMBAH ASET INFRASTRUKTUR
export async function createInfrastructure(data: any) {
  try {
    await sql`
      INSERT INTO infrastructures (
        website_id, type, provider, asset, expiry, status, purchase_date, renewal_price, billing_cycle
      ) VALUES (
        ${data.websiteId}, ${data.type}, ${data.provider}, ${data.asset}, 
        ${data.expiry}, ${data.status}, ${data.purchaseDate}, ${data.renewalPrice}, ${data.billingCycle}
      )
    `;

    revalidatePath("/infrastructures");
    revalidatePath(`/websites/${data.websiteId}`);
    return { success: true };
  } catch (error: any) {
    console.error("GAGAL SIMPAN INFRA:", error);
    return { success: false, message: error.message };
  }
}

// 2. EDIT / UPDATE ASET INFRASTRUKTUR
export async function updateInfrastructure(id: number | string, data: any) {
  try {
    await sql`
      UPDATE infrastructures
      SET 
        website_id = ${data.websiteId},
        type = ${data.type},
        provider = ${data.provider},
        asset = ${data.asset},
        expiry = ${data.expiry},
        status = ${data.status},
        purchase_date = ${data.purchaseDate},
        renewal_price = ${data.renewalPrice},
        billing_cycle = ${data.billingCycle}
      WHERE id = ${id}
    `;

    revalidatePath("/infrastructures");
    revalidatePath(`/websites/${data.websiteId}`);
    return { success: true };
  } catch (error: any) {
    console.error("GAGAL EDIT INFRA:", error);
    return { success: false, message: error.message };
  }
}

// 3. HAPUS ASET INFRASTRUKTUR
export async function deleteInfrastructure(id: number | string, websiteId?: number | string) {
  try {
    await sql`DELETE FROM infrastructures WHERE id = ${id}`;
    
    revalidatePath("/infrastructures");
    if (websiteId) revalidatePath(`/websites/${websiteId}`);
    return { success: true };
  } catch (error: any) {
    console.error("GAGAL HAPUS INFRA:", error);
    return { success: false, message: error.message };
  }
}