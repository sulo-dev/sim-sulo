// --- Tipe Data (Opsional tapi sangat disarankan di TypeScript) ---
export type Ticket = {
  id: string;
  title: string;
  priority: string;
  status: string;
  date: string;
};

// --- 1. Data Klien (digunakan di ClientsPage) ---
export const mockClients = [
  {
    id: 1,
    companyName: "CV Afila Media Karya",
    picName: "Bpk. Ahmad",
    email: "contact@afila.com",
    websites: ["Sikeris Management"],
    status: "Active",
  },
  {
    id: 2,
    companyName: "Pemerintah Desa",
    picName: "Kepala Desa",
    email: "pemdes@digitaldesa.id",
    websites: ["Portal Desa Digital"],
    status: "Active",
  },
  {
    id: 3,
    companyName: "SULO.dev",
    picName: "Admin Internal",
    email: "admin@sulo.dev",
    websites: ["SULO-MIS", "SULO Landing Page"],
    status: "Internal",
  },
];

export const allWebsites = [
  { id: 1, name: "Portal Desa Digital", client: "Pemerintah Desa", stack: "Next.js / Tailwind", status: "Active" },
  { id: 2, name: "Sikeris Management", client: "CV Afila Media Karya", stack: "React / Node", status: "Warranty" },
  { id: 3, name: "SULO-MIS", client: "SULO.dev", stack: "Next.js / Prisma", status: "Internal" },
  { id: 4, name: "SULO Landing Page", client: "SULO.dev", stack: "Astro", status: "Active" },
  { id: 5, name: "Sistem HRD Internal", client: "PT. Angkasa", stack: "Laravel / Vue", status: "Warranty" },
];

// --- 2. Data Detail Website (digunakan di WebsiteDetailPage) ---
// --- 2. Data Detail Website (digunakan di WebsiteDetailPage) ---
export const mockWebsite = {
  // ... (data atas biarkan sama)
  id: 1,
  name: "Portal Desa Digital",
  clientName: "Pemerintah Desa",
  productionUrl: "https://desadigital.id",
  stagingUrl: "https://staging.desadigital.id",
  techStack: ["Next.js", "Tailwind CSS", "TypeScript"],
  status: "Active Contract",
  goLiveDate: "15 Agustus 2026",
  infrastructures: [
    {
      id: 1,
      type: "Domain",
      provider: "Niagahoster",
      asset: "desadigital.id",
      expiry: "15 Agu 2027",
      status: "Safe",
      purchaseDate: "15 Agu 2026",
      renewalPrice: "Rp 150.000 / tahun",
    },
    {
      id: 2,
      type: "Hosting",
      provider: "Vercel",
      asset: "Pro Plan",
      expiry: "15 Sep 2026",
      status: "Warning",
      purchaseDate: "15 Agu 2026",
      renewalPrice: "Rp 300.000 / bulan",
    },
  ],
  // ... (credentials biarkan sama)
  credentials: [
    {
      id: 1,
      category: "CMS",
      username: "admin_desa",
      url: "https://desadigital.id/admin",
    },
    {
      id: 2,
      category: "Database",
      username: "neon_db_user",
      url: "https://console.neon.tech",
    },
  ],
  documents: [
    {
      id: 1,
      title: "Surat Perintah Kerja (SPK) - Tahap 1",
      type: "SPK",
      uploadedBy: "Admin SULO",
      date: "10 Jul 2026",
      size: "1.1 MB",
    },
    {
      id: 2,
      title: "Berita Acara Serah Terima (BAST) V1",
      type: "BAST",
      uploadedBy: "Admin SULO",
      date: "16 Agu 2026",
      size: "2.4 MB",
    },
    {
      id: 3,
      title: "User Manual - Panduan CMS Desa",
      type: "Manual",
      uploadedBy: "Admin SULO",
      date: "18 Agu 2026",
      size: "5.7 MB",
    },
  ],
};

// --- 3. Data Tiket Kanban (digunakan di KanbanBoard) ---
export const initialTickets: Ticket[] = [
  {
    id: "1",
    title: "Update data perangkat desa (Tari Paduppa)",
    priority: "Medium",
    status: "Open",
    date: "05 Sep 2026",
  },
  {
    id: "2",
    title: "Perbaiki bug di halaman Rambu Solo",
    priority: "High",
    status: "Fixing",
    date: "06 Sep 2026",
  },
  {
    id: "3",
    title: "Optimasi ukuran gambar galeri",
    priority: "Low",
    status: "Resolved",
    date: "07 Sep 2026",
  },
  {
    id: "4",
    title: "Ubah warna latar footer",
    priority: "Low",
    status: "Open",
    date: "08 Sep 2026",
  },
];


export const allInfrastructures = [
  {
    id: 1,
    website: "Portal Desa Digital",
    type: "Domain",
    provider: "Niagahoster",
    asset: "desadigital.id",
    expiry: "15 Agu 2027",
    status: "Safe",
  },
  {
    id: 2,
    website: "Portal Desa Digital",
    type: "Hosting",
    provider: "Vercel",
    asset: "Pro Plan",
    expiry: "15 Sep 2026",
    status: "Warning",
  },
  {
    id: 3,
    website: "Sikeris Management",
    type: "Server",
    provider: "DigitalOcean",
    asset: "Droplet 4GB",
    expiry: "01 Nov 2026",
    status: "Safe",
  },
  {
    id: 4,
    website: "SULO Landing Page",
    type: "Domain",
    provider: "Cloudflare",
    asset: "sulo.dev",
    expiry: "20 Okt 2026",
    status: "Warning",
  },
];

export const allTickets = [
  { id: "TKT-001", website: "Portal Desa Digital", title: "Update data perangkat desa (Tari Paduppa)", priority: "Medium", status: "Open", date: "05 Sep 2026", description: "Mohon update struktur organisasi perangkat desa pada halaman profil, khususnya untuk bagian seksi kebudayaan (Tari Paduppa)." },
  { id: "TKT-002", website: "Portal Desa Digital", title: "Perbaiki bug di halaman Rambu Solo", priority: "High", status: "Fixing", date: "06 Sep 2026", description: "Gambar galeri pada halaman kebudayaan Rambu Solo tidak bisa diklik saat dibuka melalui perangkat mobile (layar kecil)." },
  { id: "TKT-003", website: "Sikeris Management", title: "Gagal export laporan PDF", priority: "High", status: "Open", date: "08 Sep 2026", description: "Ketika menekan tombol export PDF pada modul laporan keuangan, browser hanya loading terus menerus dan file tidak terunduh." },
  { id: "TKT-004", website: "SULO-MIS", title: "Hubungkan Prisma ke Neon DB", priority: "Medium", status: "Open", date: "08 Sep 2026", description: "Tolong sesuaikan connection string Prisma agar mengarah ke database staging di Neon DB sebelum rilis minggu depan." },
  { id: "TKT-005", website: "Sistem HRD Internal", title: "Tombol reset cuti tidak merespon", priority: "Low", status: "Resolved", date: "09 Sep 2026", description: "Tombol reset jatah cuti tahunan di dashboard admin HRD sudah tidak merespon sejak update terakhir." },
];

// --- 4. Data Keuangan & Penagihan (digunakan di FinancePage) ---
// --- 4. Data Keuangan & Penagihan ---
export const mockFinances = [
  { 
    id: 1, 
    client: "Pemerintah Desa", 
    project: "Portal Desa Digital", 
    billingCycle: "Bulanan", 
    revenue: 1500000, 
    infrastructureCost: 300000, 
    costBreakdown: [
      { item: "Vercel Pro Hosting", amount: 300000 }
    ],
    nextBilling: "15 Sep 2026", 
    status: "Unpaid" 
  },
  { 
    id: 2, 
    client: "CV Afila Media Karya", 
    project: "Sikeris Management", 
    billingCycle: "Tahunan", 
    revenue: 5000000, 
    infrastructureCost: 1200000, 
    costBreakdown: [
      { item: "DigitalOcean Droplet 4GB", amount: 1050000 },
      { item: "Domain .com Niagahoster", amount: 150000 }
    ],
    nextBilling: "10 Nov 2026", 
    status: "Paid" 
  },
  { 
    id: 3, 
    client: "SULO.dev", 
    project: "SULO Landing Page", 
    billingCycle: "Tahunan", 
    revenue: 0, 
    infrastructureCost: 450000, 
    costBreakdown: [
      { item: "Cloudflare Domain Renewal", amount: 450000 }
    ],
    nextBilling: "20 Okt 2026", 
    status: "Internal" 
  },
];

// --- 5. Data Audit Trail (Log Keamanan) ---
export const mockAuditLogs = [
  { id: "LOG-1045", timestamp: "08 Sep 2026, 10:45:21", admin: "Admin SULO", action: "UPDATE", target: "Vault Kredensial (Portal Desa)", ipAddress: "114.125.10.22", status: "Success" },
  { id: "LOG-0912", timestamp: "08 Sep 2026, 09:12:05", admin: "Admin SULO", action: "DELETE", target: "Infrastruktur Hosting (Staging)", ipAddress: "114.125.10.22", status: "Critical" },
  { id: "LOG-2301", timestamp: "07 Sep 2026, 23:01:44", admin: "System Cron", action: "SYNC", target: "Automated Vercel Blob Backup", ipAddress: "10.0.0.1 (Internal)", status: "Success" },
  { id: "LOG-1530", timestamp: "07 Sep 2026, 15:30:10", admin: "Admin SULO", action: "CREATE", target: "Klien Baru (CV Afila Media)", ipAddress: "114.125.10.45", status: "Success" },
  { id: "LOG-0805", timestamp: "07 Sep 2026, 08:05:00", admin: "Admin SULO", action: "LOGIN", target: "Autentikasi Sesi Baru", ipAddress: "114.125.10.45", status: "Success" },
];

// --- 6. Data Tim & HRIS (digunakan di TeamPage) ---
export const mockTeam = [
  { 
    id: 1, 
    name: "Admin SULO", 
    email: "admin@sulo.dev", 
    specialty: "Full-Stack Engineer", 
    annualLeaveQuota: 8, 
    isOnLeave: false, 
    lastLogin: "08 Sep 2026, 08:05 WITA" 
  },
  { 
    id: 2, 
    name: "Ahmad Rizky", 
    email: "rizky@sulo.dev", 
    specialty: "UI/UX Designer", 
    annualLeaveQuota: 12, 
    isOnLeave: false, 
    lastLogin: "07 Sep 2026, 14:22 WITA" 
  },
  { 
    id: 3, 
    name: "Citra Kirana", 
    email: "citra@sulo.dev", 
    specialty: "Project Manager", 
    annualLeaveQuota: 2, 
    isOnLeave: true, 
    lastLogin: "05 Sep 2026, 17:00 WITA" 
  },
];
