"use server";

import { sql } from "@/lib/db"; 
import { revalidatePath } from "next/cache";

// 1. FUNGSI TAMBAH KLIEN
export async function createClient(data: {
  companyName: string;
  picName: string;
  email: string;
}) {
  try {
    await sql`
      INSERT INTO clients (company_name, pic_name, email, status)
      VALUES (${data.companyName}, ${data.picName}, ${data.email}, 'Active')
    `;

    revalidatePath("/clients");
    return { success: true, message: "Klien berhasil ditambahkan." };
  } catch (error: any) {
    console.error("Error createClient:", error);
    return { success: false, message: error.message || "Gagal menambah klien." };
  }
}

// 2. FUNGSI EDIT KLIEN
export async function updateClient(
  id: number | string,
  data: {
    companyName: string;
    picName: string;
    email: string;
    status: string;
  }
) {
  try {
    await sql`
      UPDATE clients
      SET 
        company_name = ${data.companyName},
        pic_name = ${data.picName},
        email = ${data.email},
        status = ${data.status}
      WHERE id = ${id}
    `;

    revalidatePath("/clients");
    return { success: true, message: "Data klien berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updateClient:", error);
    return { success: false, message: error.message || "Gagal memperbarui klien." };
  }
}

// 3. FUNGSI HAPUS KLIEN
export async function deleteClient(id: number | string) {
  try {
    await sql`DELETE FROM clients WHERE id = ${id}`;
    revalidatePath("/clients");
    return { success: true, message: "Klien berhasil dihapus." };
  } catch (error: any) {
    console.error("Error deleteClient:", error);
    return { success: false, message: error.message || "Gagal menghapus klien." };
  }
}