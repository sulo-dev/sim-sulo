"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

export async function createDocument(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const websiteId = formData.get("websiteId") as string;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const uploadedBy = formData.get("uploadedBy") as string;
    const fileSize = formData.get("fileSize") as string;

    if (!file) throw new Error("File dokumen tidak ditemukan.");

    const blob = await put(file.name, file, { 
      access: 'public',
      addRandomSuffix: true 
    });

    const uploadDate = new Date().toISOString().split("T")[0]; 

    await sql`
      INSERT INTO documents (
        website_id, title, type, uploaded_by, upload_date, file_size, file_url
      ) VALUES (
        ${websiteId}, ${title}, ${type}, ${uploadedBy}, ${uploadDate}, ${fileSize}, ${blob.url}
      )
    `;

    revalidatePath(`/websites/${websiteId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Terjadi kesalahan sistem." };
  }
}

// === FUNGSI BARU: HAPUS DOKUMEN ===
export async function deleteDocument(documentId: number, fileUrl: string, websiteId: number) {
  try {
    // 1. Hapus file fisik dari Vercel Blob (Jika valid)
    if (fileUrl && fileUrl.includes("public.blob.vercel-storage.com")) {
      await del(fileUrl);
    }
    
    // 2. Hapus data dari Database Neon
    await sql`DELETE FROM documents WHERE id = ${documentId}`;
    
    revalidatePath(`/websites/${websiteId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// === FUNGSI BARU: EDIT & GANTI DOKUMEN ===
export async function updateDocument(formData: FormData) {
  try {
    const documentId = Number(formData.get("documentId"));
    const websiteId = Number(formData.get("websiteId"));
    const title = formData.get("title") as string;
    const oldFileUrl = formData.get("oldFileUrl") as string;
    
    // Cek apakah user mengunggah file baru
    const newFile = formData.get("file") as File | null;

    if (newFile && newFile.size > 0) {
      // 1. Hapus file lama dari Vercel Blob
      if (oldFileUrl && oldFileUrl.includes("vercel-storage.com")) {
        await del(oldFileUrl);
      }

      // 2. Unggah file baru
      const blob = await put(newFile.name, newFile, { 
        access: 'public', addRandomSuffix: true 
      });

      // Kalkulasi ukuran baru
      const sizeInKb = Math.round(newFile.size / 1024);
      const newFileSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(2)} MB` : `${sizeInKb} KB`;

      // 3. Update Database (Judul, URL Baru, Ukuran Baru)
      await sql`
        UPDATE documents 
        SET title = ${title}, file_url = ${blob.url}, file_size = ${newFileSize} 
        WHERE id = ${documentId}
      `;
    } else {
      // Jika tidak ada file baru, cukup update judulnya saja
      await sql`UPDATE documents SET title = ${title} WHERE id = ${documentId}`;
    }

    revalidatePath(`/websites/${websiteId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}