"use server";

import { sql } from "@/lib/db"; 
import { revalidatePath } from "next/cache";

// 1. FUNGSI TAMBAH
export async function createWebsite(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const clientId = Number(formData.get("clientId"));
    const status = formData.get("status") as string;
    const techStack = (formData.get("techStack") as string) || null;
    const productionUrl = (formData.get("productionUrl") as string) || null;

    console.log("MENCOBA SIMPAN KE DB:", { name, clientId, status, techStack, productionUrl });

    await sql`
      INSERT INTO websites (client_id, name, tech_stack, status, production_url)
      VALUES (${clientId}, ${name}, ${techStack}, ${status}, ${productionUrl})
    `;

    revalidatePath("/websites");
    return { success: true };
  } catch (error: any) {
    console.error("GAGAL SIMPAN DB:", error);
    return { success: false, message: error.message || "Gagal menambah website." };
  }
}

// 2. FUNGSI EDIT
export async function updateWebsite(id: number | string, data: any) {
  try {
    console.log("MENCOBA EDIT KE DB:", { id, ...data });

    await sql`
      UPDATE websites
      SET 
        name = ${data.name},
        client_id = ${data.clientId},
        status = ${data.status},
        tech_stack = ${data.techStack},
        production_url = ${data.productionUrl}
      WHERE id = ${id}
    `;

    revalidatePath("/websites");
    return { success: true };
  } catch (error: any) {
    console.error("GAGAL EDIT DB:", error);
    return { success: false, message: error.message || "Gagal memperbarui website." };
  }
}

// 3. FUNGSI HAPUS
export async function deleteWebsite(id: number | string) {
  try {
    // ON DELETE CASCADE akan otomatis menghapus infrastruktur/tiket terkait di DB
    await sql`DELETE FROM websites WHERE id = ${id}`;
    
    revalidatePath("/websites");
    return { success: true };
  } catch (error: any) {
    console.error("GAGAL HAPUS DB:", error);
    return { success: false, message: error.message || "Gagal menghapus website." };
  }
}