"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type CredentialInput = {
  websiteId: number;
  category: string;
  username: string;
  password?: string;
  accessUrl?: string;
  title?: string;
  port?: string;
  notes?: string;
};

// 1. Tambah Kredensial Baru
export async function createCredential(websiteId: number, data: Omit<CredentialInput, "websiteId">) {
  try {
    if (!websiteId || !data.category || !data.username) {
      return { success: false, message: "Kategori dan Username wajib diisi!" };
    }

    const title = data.title || `${data.category} - ${data.username}`;

    await sql`
      INSERT INTO credentials (website_id, category, username, password, access_url, title, port, notes)
      VALUES (
        ${websiteId},
        ${data.category},
        ${data.username},
        ${data.password || ""},
        ${data.accessUrl || ""},
        ${title},
        ${data.port || ""},
        ${data.notes || ""}
      )
    `;

    revalidatePath(`/websites/${websiteId}`);
    revalidatePath("/websites");
    revalidatePath("/vault");
    return { success: true, message: "Kredensial berhasil disimpan ke brankas!" };
  } catch (error) {
    console.error("[CREDENTIAL_CREATE_ERROR]", error);
    return { success: false, message: "Gagal menyimpan kredensial." };
  }
}

// 2. Update Kredensial
export async function updateCredential(id: number, websiteId: number, data: Omit<CredentialInput, "websiteId">) {
  try {
    const title = data.title || `${data.category} - ${data.username}`;

    await sql`
      UPDATE credentials
      SET 
        category = ${data.category},
        username = ${data.username},
        password = ${data.password || ""},
        access_url = ${data.accessUrl || ""},
        title = ${title},
        port = ${data.port || ""},
        notes = ${data.notes || ""}
      WHERE id = ${id}
    `;

    revalidatePath(`/websites/${websiteId}`);
    revalidatePath("/websites");
    revalidatePath("/vault");
    return { success: true, message: "Kredensial berhasil diperbarui!" };
  } catch (error) {
    console.error("[CREDENTIAL_UPDATE_ERROR]", error);
    return { success: false, message: "Gagal mengupdate kredensial." };
  }
}

// 3. Hapus Kredensial
export async function deleteCredential(id: number, websiteId?: number) {
  try {
    await sql`DELETE FROM credentials WHERE id = ${id}`;

    if (websiteId) revalidatePath(`/websites/${websiteId}`);
    revalidatePath("/websites");
    revalidatePath("/vault");
    return { success: true, message: "Kredensial berhasil dihapus." };
  } catch (error) {
    console.error("[CREDENTIAL_DELETE_ERROR]", error);
    return { success: false, message: "Gagal menghapus kredensial." };
  }
}