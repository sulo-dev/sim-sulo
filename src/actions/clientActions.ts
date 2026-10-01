"use server";

import { sql } from "@/lib/db"; 
import { revalidatePath } from "next/cache";

// 1. FUNGSI TAMBAH KLIEN
export async function createClient(data: {
  companyName: string;
  picName: string;
  email: string;
  phone: string;
}) {
  try {
    await sql`
      INSERT INTO clients (company_name, pic_name, email, phone, status)
      VALUES (${data.companyName}, ${data.picName}, ${data.email}, ${data.phone}, 'Active')
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
    phone: string;
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
        phone = ${data.phone},
        status = ${data.status}
      WHERE id = ${id}
    `;

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return { success: true, message: "Data klien berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updateClient:", error);
    return { success: false, message: error.message || "Gagal memperbarui klien." };
  }
}

// 3. FUNGSI HAPUS KLIEN (DENGAN PROTEKSI PROYEK AKTIF)
export async function deleteClient(id: number | string) {
  try {
    // Proteksi: Cek apakah klien masih memiliki proyek website terdaftar
    const checkQuery: any = await sql`SELECT COUNT(*) as total FROM websites WHERE client_id = ${id}`;
    const rows = Array.isArray(checkQuery) ? checkQuery : checkQuery.rows || [];
    const totalProjects = rows.length > 0 ? Number(rows[0].total) : 0;

    if (totalProjects > 0) {
      return { 
        success: false, 
        message: `Klien ini tidak dapat dihapus karena masih memiliki ${totalProjects} proyek website aktif.` 
      };
    }

    await sql`DELETE FROM clients WHERE id = ${id}`;
    revalidatePath("/clients");
    return { success: true, message: "Klien berhasil dihapus." };
  } catch (error: any) {
    console.error("Error deleteClient:", error);
    return { success: false, message: error.message || "Gagal menghapus klien." };
  }
}