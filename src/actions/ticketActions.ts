"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Tambah Tiket Baru
export async function createTicket(data: any) {
  try {
    // Generate ID unik, misal: TKT-4829
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-${randomNum}`;

    await sql`
      INSERT INTO tickets (id, website_id, title, priority, status, reported_date, description)
      VALUES (
        ${ticketId}, 
        ${data.websiteId}, 
        ${data.title}, 
        ${data.priority}, 
        ${data.status}, 
        ${data.reportedDate}, 
        ${data.description}
      )
    `;

    revalidatePath("/tickets");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 2. Update Tiket
export async function updateTicket(id: string, data: any) {
  try {
    await sql`
      UPDATE tickets
      SET 
        website_id = ${data.websiteId},
        title = ${data.title},
        priority = ${data.priority},
        status = ${data.status},
        reported_date = ${data.reportedDate},
        description = ${data.description}
      WHERE id = ${id}
    `;

    revalidatePath("/tickets");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 3. Hapus Tiket
export async function deleteTicket(id: string) {
  try {
    await sql`DELETE FROM tickets WHERE id = ${id}`;
    revalidatePath("/tickets");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Tambahkan di bagian bawah src/actions/ticketActions.ts

export async function updateTicketStatus(id: string, newStatus: string) {
  try {
    await sql`UPDATE tickets SET status = ${newStatus} WHERE id = ${id}`;
    revalidatePath("/tickets");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}