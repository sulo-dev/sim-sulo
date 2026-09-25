"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. TAMBAH KARYAWAN
// 1. TAMBAH KARYAWAN (Dengan Auto-ID)
export async function createUser(data: {
  name: string;
  email: string;
  role: string;
  phone: string;
  joined_date: string;
  annual_leave_quota: number;
}) {
  try {
    // Cek apakah Email sudah ada
    const checkEmail = await sql`SELECT email FROM users WHERE email = ${data.email}`;
    if (checkEmail.length > 0) return { success: false, message: "Email sudah digunakan!" };

    // MENGHASILKAN ID OTOMATIS (Contoh: USR-001, USR-002)
    const lastUser = await sql`SELECT id FROM users WHERE id LIKE 'USR-%' ORDER BY id DESC LIMIT 1`;
    let newId = 'USR-001';
    
    if (lastUser.length > 0) {
      // Mengambil angka dari ID terakhir (misal dari USR-005 diambil 5)
      const lastIdNum = parseInt(lastUser[0].id.replace('USR-', ''), 10);
      newId = `USR-${(lastIdNum + 1).toString().padStart(3, '0')}`;
    }

    await sql`
      INSERT INTO users (id, name, email, role, phone, joined_date, annual_leave_quota, status, is_on_leave, password)
      VALUES (${newId}, ${data.name}, ${data.email}, ${data.role}, ${data.phone}, ${data.joined_date}, ${data.annual_leave_quota}, 'Active', false, 'sulo123')
    `;

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 2. UPDATE KARYAWAN
export async function updateUser(id: string, data: {
  name: string;
  email: string;
  role: string;
  phone: string;
  status: string;
  annual_leave_quota: number;
  is_on_leave: boolean;
}) {
  try {
    await sql`
      UPDATE users 
      SET 
        name = ${data.name},
        email = ${data.email},
        role = ${data.role},
        phone = ${data.phone},
        status = ${data.status},
        annual_leave_quota = ${data.annual_leave_quota},
        is_on_leave = ${data.is_on_leave}
      WHERE id = ${id}
    `;

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 3. HAPUS KARYAWAN
export async function deleteUser(id: string) {
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}