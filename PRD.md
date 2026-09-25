\# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD) LENGKAP

\*\*Nama Produk:\*\* SULO-MIS (Management Information System) - \*Next.js & Tailwind v4 Edition\*

\*\*Versi:\*\* 4.0.0 (Final Tech Stack)

\*\*Tanggal Dokumen:\*\* 7 September 2026

\*\*Fokus Utama:\*\* Post-Release Operations, Maintenance, & Internal Assets

\## 1. Ringkasan Eksekutif

\*\*SULO-MIS\*\* adalah platform tata kelola internal terpusat yang dirancang untuk memanajemen siklus operasional dan pemeliharaan website klien pasca-rilis. Sistem \*admin-only\* ini memecahkan kendala pengelolaan aset digital (peringatan perpanjangan server/domain), penyimpanan kredensial aman (Vault), pelacakan tiket perbaikan (Helpdesk), manajemen cuti internal, serta pengarsipan dokumen legal.

\## 2. Arsitektur & Teknologi Inti

\* \*\*Front-end & Back-end Framework:\*\* \*\*Next.js (App Router)\*\* dengan \*\*TypeScript (TSX)\*\*. Menggunakan arsitektur \*React Server Components (RSC)\* untuk kecepatan pemuatan data dan keamanan (Vault), dipadu \*Client Components\* untuk interaksi UI.

\* \*\*Styling Engine:\*\* \*\*Tailwind CSS v4\*\*. Menggunakan kompilator \*Oxide\* dan konfigurasi \*CSS-first\* tanpa file konfigurasi eksternal, mempercepat \*build time\* dan meringankan ukuran \*bundle\*.

\* \*\*Animasi & Transisi:\*\* \*\*Framer Motion\*\*.

\* \*\*Database & ORM:\*\* \*\*Neon Database (PostgreSQL)\*\* dan \*\*Prisma ORM\*\* untuk validasi \*Type-Safety\* dari ujung ke ujung.

\* \*\*Authentication:\*\* \*\*NextAuth.js (Auth.js)\*\* dengan manajemen sesi berbasis JWT.

\* \*\*File Storage:\*\* \*\*Vercel Blob\*\* melalui integrasi \`@vercel/blob\` SDK di \*Server Actions\*.

\## 3. Pedoman UI/UX & Desain (Tailwind v4)

Pendekatan visual menggunakan elemen \*Glassmorphism\* dan 3D UI yang didesain agar \*seamless\* dan tidak membebani peramban.

\* \*\*Palet Warna Global (\`globals.css\`):\*\*

Seluruh penyesuaian tema warna tombol dan elemen antarmuka diatur menggunakan variabel CSS dinamis bawaan Tailwind v4 (\`@theme\`).

\* \`--color-sulo-base: #011D58;\` (Kanvas utama)

\* \`--color-sulo-primary: #FA4D09;\` (CTA utama, status kritis)

\* \`--color-sulo-secondary: #FC7A0B;\` (\*Hover state\*, \*border glassmorphism\*)

\* \`--color-sulo-highlight: #FF9F03;\` (Notifikasi \*warning\*, elemen \*glow\*)

\* \*\*Utilitas Kustom & Pencegahan Render Issue:\*\*

\* Implementasi \*Glassmorphism\* dipanggil secara ringkas melalui \`@utility glass-panel\` untuk menjaga konsistensi pada kartu proyek atau laci detail (\*slide-over\*).

\* Kombinasi \*Virtual DOM\* React dan mesin \*parsing\* Tailwind v4 memastikan ketiadaan \*screen flickering\* (layar berkedip) saat merender iterasi data besar (seperti \*looping\* daftar tagihan klien atau rekapitulasi data anggota).

\* Komponen \*confirmation popup modals\* (contoh: peringatan sebelum menghapus akses \*Vault\* atau mereset data) distandarisasi menggunakan \*Client Component\* berbalut Framer Motion agar transisi masuk/keluar layar sangat mulus.

\## 4. Keamanan & Hak Akses (Single-Role Admin)

1\. \*\*Admin-Only System:\*\* Tidak ada hierarki \*Role-Based Access Control\* (RBAC). Semua pengguna adalah \*\*Admin\*\* dengan visibilitas 100%.

2\. \*\*Proteksi Sesi (Auto-Logout):\*\* NextAuth dikonfigurasi untuk memutuskan sesi (\*logout\*) otomatis jika tidak ada aktivitas (\*idle\*) selama 45 menit, mencegah kebocoran \*password\* klien.

3\. \*\*Enkripsi Kredensial:\*\* Data \*password\* di modul Vault dienkripsi menggunakan modul \`crypto\` Node.js (AES-256-GCM) di \*Server Actions\* sebelum masuk ke Prisma.

4\. \*\*Audit Trail Absolut:\*\* Perekaman aktivitas mutlak (\`\[Timestamp\] - \[Admin\] - \[Aksi\]\`) untuk setiap pergerakan data sensitif.

\## 5. Spesifikasi Modul Fungsional

\* \*\*Dashboard Operasional (Server Component):\*\* Memuat widget \*Monthly Recurring Revenue\* (MRR), total tiket terbuka, dan \*Critical Alerts\* (3D Glow) untuk domain/hosting yang akan kedaluwarsa (H-30, H-14, H-3) tanpa \*loading state\* berkepanjangan.

\* \*\*Direktori Website & Vault (Hybrid Components):\*\*

\* \*Grid\* kartu proyek (nama klien, URL, status kontrak) di-render di \*server\*.

\* Brankas kredensial (\*Vault\*) menggunakan laci panel interaktif di \*client-side\*. Teks sandi disamarkan (\`••••••\`) dengan tombol \`Salin 📋\` terintegrasi.

\* \*\*Manajemen Infrastruktur & Lisensi:\*\* Pencatatan nama aset, registrar (misal: Niagahoster), dan harga perpanjangan. \*Cron job\* Vercel mengeksekusi pemeriksaan tanggal kedaluwarsa setiap tengah malam.

\* \*\*Ticketing & Bug Tracker (Helpdesk):\*\* \*Kanban board\* interaktif untuk melacak tiket perbaikan dari klien (Tiket Baru -> Perbaikan -> Selesai). \*Container queries\* Tailwind v4 memastikan kartu \*task drag-and-drop\* tetap proporsional.

\* \*\*Dokumen Serah Terima:\*\* Penyimpanan BAST, SPK, dan \*User Manual\* ke Vercel Blob, mengembalikan \*Signed URL\* aman ke \*database\*.

\* \*\*CRM & Keuangan:\*\* Tabel tagihan berulang (\*Recurring Invoices\*) dan kalkulasi margin laba/rugi pemeliharaan setiap proyek.

\* \*\*Database Anggota & Presensi (HRIS Mini):\*\* Menampilkan direktori spesialisasi tim dan antarmuka manajemen jadwal. Modul ini dilengkapi pengelolaan cuti otomatis, memastikan form aksi kritis seperti \*reset kuota cuti tahunan\* (\*annual leave quota\*) terlindungi oleh \*popup modal\* konfirmasi yang konsisten dengan tema aplikasi.

\* \*\*Pengaturan & Audit Trail:\*\* Manajemen nilai mutlak (\*dropdown\* kustom) dan log aktivitas keamanan yang tidak dapat dihapus.

\## 6. Skema Database Inti (Prisma \`schema.prisma\`)

\`\`\`prisma

generator client {

provider = "prisma-client-js"

}

datasource db {

provider = "postgresql"

url = env("DATABASE\_URL")

}

model User {

id BigInt @id @default(autoincrement())

name String

email String @unique

password String

specialty String?

annualLeaveQuota Int @default(12)

isOnLeave Boolean @default(false)

lastLoginAt DateTime?

auditLogs AuditLog\[\]

documents Document\[\]

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

}

model Client {

id BigInt @id @default(autoincrement())

companyName String

picName String

email String?

phone String?

address String?

websites Website\[\]

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

}

model Website {

id BigInt @id @default(autoincrement())

clientId BigInt

client Client @relation(fields: \[clientId\], references: \[id\])

name String

productionUrl String

stagingUrl String?

techStack Json? // \["Next.js", "Tailwind v4"\]

maintenanceStatus String // 'warranty', 'active\_contract', 'no\_support'

goLiveDate DateTime?

infrastructures Infrastructure\[\]

credentials Credential\[\]

documents Document\[\]

tickets Ticket\[\]

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

}

model Infrastructure {

id BigInt @id @default(autoincrement())

websiteId BigInt?

website Website? @relation(fields: \[websiteId\], references: \[id\])

type String // 'domain', 'hosting', 'ssl'

providerName String

assetName String

purchaseDate DateTime

expiryDate DateTime

renewalPrice Decimal

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

}

model Credential {

id BigInt @id @default(autoincrement())

websiteId BigInt

website Website @relation(fields: \[websiteId\], references: \[id\])

category String // 'cms', 'database', 'server'

username String

encryptedPassword String

accessUrl String?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

}

model Ticket {

id BigInt @id @default(autoincrement())

websiteId BigInt

website Website @relation(fields: \[websiteId\], references: \[id\])

reportedBy String

title String

priority String // 'low', 'medium', 'high'

status String // 'open', 'fixing', 'resolved'

attachmentUrl String?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

}

model Document {

id BigInt @id @default(autoincrement())

websiteId BigInt

website Website @relation(fields: \[websiteId\], references: \[id\])

uploadedBy BigInt

user User @relation(fields: \[uploadedBy\], references: \[id\])

title String

type String // 'bast', 'spk'

fileUrl String

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

}

model AuditLog {

id BigInt @id @default(autoincrement())

userId BigInt

user User @relation(fields: \[userId\], references: \[id\])

action String

targetTable String

targetId BigInt

description String

ipAddress String?

createdAt DateTime @default(now())

}7. Rencana Fase Pengembangan (Milestones)

1.  **Fase Inisialisasi:** Setup proyek create-next-app (TSX), penyesuaian @theme di globals.css (Tailwind v4), inisialisasi Prisma & Neon DB, dan konfigurasi NextAuth.js.
    
2.  **Fase Inti Sistem:** Pembuatan komponen glass-panel yang _reusable_, pengembangan modul Klien & Website, integrasi enkripsi modul Vault, dan modul Database Anggota.
    
3.  **Fase Integrasi & Operasional:** Integrasi vercel/blob untuk penyimpanan BAST/Lampiran Tiket, pembuatan Kanban Helpdesk (Framer Motion + dnd-kit), dan sistem _Cron Job_ Infrastruktur.
    
4.  **Fase Finalisasi:** Penyelesaian _Dashboard Helicopter View_, perapihan _popup confirmation modals_, dan pengujian beban iterasi data.