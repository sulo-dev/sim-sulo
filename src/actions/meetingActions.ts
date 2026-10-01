// src/actions/meetingActions.ts
"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createMeetingLog(data: {
  clientId: number;
  title: string;
  meetingDate: string;
  notes: string;
}) {
  try {
    await sql`
      INSERT INTO meeting_logs (client_id, title, meeting_date, notes)
      VALUES (${data.clientId}, ${data.title}, ${data.meetingDate}, ${data.notes})
    `;
    revalidatePath(`/clients/${data.clientId}`);
    return { success: true, message: "Catatan meeting berhasil ditambahkan." };
  } catch (error: any) {
    console.error("Error createMeetingLog:", error);
    return { success: false, message: error.message || "Gagal menambah catatan." };
  }
}

export async function deleteMeetingLog(id: number, clientId: number) {
  try {
    await sql`DELETE FROM meeting_logs WHERE id = ${id}`;
    revalidatePath(`/clients/${clientId}`);
    return { success: true, message: "Catatan meeting berhasil dihapus." };
  } catch (error: any) {
    console.error("Error deleteMeetingLog:", error);
    return { success: false, message: error.message || "Gagal menghapus catatan." };
  }
}