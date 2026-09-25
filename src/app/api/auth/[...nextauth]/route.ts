import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@/lib/db"; // Memanggil driver koneksi Neon DB

// Fungsi Helper untuk mencatat ke tabel Audit Logs (id otomatis oleh SERIAL database)
async function logAudit(admin: string, action: string, detail: string, status: 'Success' | 'Failed', emailAttempt?: string) {
  try {
    const timestamp = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Makassar" }).replace("T", " ");
    const ipAddress = "127.0.0.1"; // Idealnya diambil dari request header, di sini menggunakan fallback aman
    const adminName = admin || emailAttempt || "Unknown Source";

    // Kolom 'id' dilewati karena menggunakan SERIAL (Auto-increment)
    await sql`
      INSERT INTO audit_logs (timestamp, admin, module, action, detail, ip_address, status)
      VALUES (${timestamp}, ${adminName}, 'Authentication', ${action}, ${detail}, ${ipAddress}, ${status})
    `;
  } catch (err) {
    console.error("[AUDIT_LOG_ERROR] Gagal mencatat log autentikasi:", err);
  }
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@sulo.dev" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          await logAudit("Unknown", "LOGIN_ATTEMPT", "Percobaan login ditolak karena input kosong.", "Failed", credentials?.email);
          return null; // Tolak jika input kosong
        }

        try {
          // 1. Query langsung ke tabel 'users' di Neon DB
          const result = await sql`
            SELECT id, name, email, password, role, status 
            FROM users 
            WHERE email = ${credentials.email}
          `;
          
          const user = result[0];

          // 2. Jika email tidak ditemukan atau password salah
          if (!user || user.password !== credentials.password) {
            await logAudit("System", "LOGIN_FAILED", `Percobaan login gagal untuk email: ${credentials.email}. Kredensial tidak valid.`, "Failed", credentials.email);
            return null;
          }

          // 3. Validasi: Status akun harus aktif
          if (user.status === 'Inactive') {
             console.warn(`Upaya login dari akun non-aktif: ${user.email}`);
             await logAudit(user.name, "LOGIN_BLOCKED", `Akses ditolak. Akun berstatus Inactive mencoba login.`, "Failed", user.email);
             return null; // Tolak akses jika akun sudah tidak aktif
          }

          // 4. Update waktu 'last_login' ke database
          const now = new Date().toISOString();
          await sql`UPDATE users SET last_login = ${now} WHERE id = ${user.id}`;

          // 5. Catat aktivitas berhasil ke Audit Logs
          await logAudit(user.name, "LOGIN_SUCCESS", `Berhasil masuk ke dalam sistem SULO-MIS.`, "Success", user.email);

          // 6. Kembalikan data user yang sukses login
          return { 
            id: user.id.toString(), 
            name: user.name, 
            email: user.email,
            role: user.role // Menyimpan role di dalam sesi
          };
          
        } catch (error) {
          console.error("Kesalahan Database saat Otentikasi:", error);
          await logAudit("System", "DB_ERROR", "Terjadi kesalahan internal saat mencoba mengotentikasi kredensial.", "Failed", credentials?.email);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 45 * 60, // Proteksi auto-logout 45 menit (sesuai PRD)
  },
  callbacks: {
    // Menyertakan data role dan ID asli dari database ke dalam JWT dan Session
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Arahkan halaman login NextAuth ke UI kustom kita
  }
});

export { handler as GET, handler as POST };