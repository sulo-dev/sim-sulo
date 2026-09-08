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
  }
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
      renewalPrice: "Rp 150.000 / tahun"
    },
    { 
      id: 2, 
      type: "Hosting", 
      provider: "Vercel", 
      asset: "Pro Plan", 
      expiry: "15 Sep 2026", 
      status: "Warning",
      purchaseDate: "15 Agu 2026",
      renewalPrice: "Rp 300.000 / bulan"
    },
  ],
  // ... (credentials biarkan sama)
  credentials: [
    { id: 1, category: "CMS", username: "admin_desa", url: "https://desadigital.id/admin" },
    { id: 2, category: "Database", username: "neon_db_user", url: "https://console.neon.tech" },
  ]
};

// --- 3. Data Tiket Kanban (digunakan di KanbanBoard) ---
export const initialTickets: Ticket[] = [
  { id: "1", title: "Update data perangkat desa (Tari Paduppa)", priority: "Medium", status: "Open", date: "05 Sep 2026" },
  { id: "2", title: "Perbaiki bug di halaman Rambu Solo", priority: "High", status: "Fixing", date: "06 Sep 2026" },
  { id: "3", title: "Optimasi ukuran gambar galeri", priority: "Low", status: "Resolved", date: "07 Sep 2026" },
  { id: "4", title: "Ubah warna latar footer", priority: "Low", status: "Open", date: "08 Sep 2026" },
];

export const allInfrastructures = [
  { id: 1, website: "Portal Desa Digital", type: "Domain", provider: "Niagahoster", asset: "desadigital.id", expiry: "15 Agu 2027", status: "Safe" },
  { id: 2, website: "Portal Desa Digital", type: "Hosting", provider: "Vercel", asset: "Pro Plan", expiry: "15 Sep 2026", status: "Warning" },
  { id: 3, website: "Sikeris Management", type: "Server", provider: "DigitalOcean", asset: "Droplet 4GB", expiry: "01 Nov 2026", status: "Safe" },
  { id: 4, website: "SULO Landing Page", type: "Domain", provider: "Cloudflare", asset: "sulo.dev", expiry: "20 Okt 2026", status: "Warning" },
];

export const allTickets = [
  { id: 1, website: "Portal Desa Digital", title: "Update data perangkat desa (Tari Paduppa)", priority: "Medium", status: "Open", date: "05 Sep 2026" },
  { id: 2, website: "Portal Desa Digital", title: "Perbaiki bug di halaman Rambu Solo", priority: "High", status: "Fixing", date: "06 Sep 2026" },
  { id: 3, website: "Sikeris Management", title: "Gagal export laporan PDF", priority: "High", status: "Open", date: "08 Sep 2026" },
  { id: 4, website: "SULO-MIS", title: "Hubungkan Prisma ke Neon DB", priority: "Medium", status: "Open", date: "08 Sep 2026" },
];

