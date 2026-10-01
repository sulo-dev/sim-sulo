"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

// ==============================================
// 1. TAMBAH ARSIP (Upload via Vercel Blob)
// ==============================================
export async function createArchive(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "Uncategorized";
    const title = formData.get("title") as string;
    const uploadedBy = (formData.get("uploadedBy") as string) || "System";
    
    // Website ID bisa null jika ini dokumen umum (NPWP, SOP, dll)
    const rawWebsiteId = formData.get("websiteId");
    const websiteId = rawWebsiteId ? Number(rawWebsiteId) : null;

    if (!file || file.size === 0) throw new Error("File dokumen tidak ditemukan atau kosong.");
    if (!title) throw new Error("Judul dokumen wajib diisi.");

    // 1. Upload ke Vercel Blob
    const blob = await put(file.name, file, { 
      access: 'public',
      addRandomSuffix: true 
    });

    // 2. Ekstrak Metadata (Ukuran dan Ekstensi)
    const sizeInKb = Math.round(file.size / 1024);
    const fileSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(2)} MB` : `${sizeInKb} KB`;
    
    // Ambil ekstensi dari nama file (contoh: 'pdf', 'docx')
    const fileNameParts = file.name.split('.');
    const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase() : 'unknown';

    // 3. Simpan ke Database
    await sql`
      INSERT INTO archives (
        category, website_id, title, file_url, file_extension, file_size, uploaded_by
      ) VALUES (
        ${category}, ${websiteId}, ${title}, ${blob.url}, ${fileExtension}, ${fileSize}, ${uploadedBy}
      )
    `;

    // 4. Revalidasi UI
    revalidatePath("/archives"); // Revalidasi halaman File Manager
    if (websiteId) revalidatePath(`/websites/${websiteId}`); // Revalidasi halaman Detail Website
    
    return { success: true };
  } catch (error: any) {
    console.error("[ARCHIVE_ERROR] Create:", error);
    return { success: false, message: error.message || "Terjadi kesalahan sistem." };
  }
}

// ==============================================
// 2. UPDATE ARSIP (Ganti Nama atau Ganti File)
// ==============================================
export async function updateArchive(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const oldFileUrl = formData.get("oldFileUrl") as string;
    
    const rawWebsiteId = formData.get("websiteId");
    const websiteId = rawWebsiteId ? Number(rawWebsiteId) : null;
    
    const newFile = formData.get("file") as File | null;

    if (newFile && newFile.size > 0) {
      // Skenario A: User ganti file fisiknya
      // 1. Hapus file lama di Vercel
      if (oldFileUrl && oldFileUrl.includes("vercel-storage.com")) {
        await del(oldFileUrl);
      }

      // 2. Upload file baru
      const blob = await put(newFile.name, newFile, { access: 'public', addRandomSuffix: true });
      const sizeInKb = Math.round(newFile.size / 1024);
      const newFileSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(2)} MB` : `${sizeInKb} KB`;
      const fileNameParts = newFile.name.split('.');
      const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase() : 'unknown';

      // 3. Update DB beserta URL baru
      await sql`
        UPDATE archives 
        SET title = ${title}, category = ${category}, website_id = ${websiteId},
            file_url = ${blob.url}, file_size = ${newFileSize}, file_extension = ${fileExtension}
        WHERE id = ${id}
      `;
    } else {
      // Skenario B: User hanya ganti judul atau kategorinya saja (File tetap)
      await sql`
        UPDATE archives 
        SET title = ${title}, category = ${category}, website_id = ${websiteId}
        WHERE id = ${id}
      `;
    }

    revalidatePath("/archives");
    if (websiteId) revalidatePath(`/websites/${websiteId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[ARCHIVE_ERROR] Update:", error);
    return { success: false, message: error.message };
  }
}

// ==============================================
// 3. HAPUS ARSIP
// ==============================================
export async function deleteArchive(id: number | string, fileUrl: string, websiteId?: number | string | null) {
  try {
    // 1. Hapus file fisik dari Vercel Blob (Jika ada)
    if (fileUrl && fileUrl.includes("vercel-storage.com")) {
      await del(fileUrl);
    }
    
    // 2. Hapus dari Database Neon
    await sql`DELETE FROM archives WHERE id = ${id}`;
    
    revalidatePath("/archives");
    if (websiteId) revalidatePath(`/websites/${websiteId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[ARCHIVE_ERROR] Delete:", error);
    return { success: false, message: error.message };
  }
}