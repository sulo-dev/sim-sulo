import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

// ==========================================
// MODULE AUGMENTATION UNTUK TYPESCRIPT
// ==========================================
// Memperluas tipe NextAuth agar mengenali field kustom (id & role) tanpa tipe "any"
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// ==========================================
// FUNGSI HELPER AUDIT LOGS SULO-MIS
// ==========================================
async function logAudit(
  admin: string,
  action: string,
  detail: string,
  status: "Success" | "Failed",
  ipAddress: string = "127.0.0.1",
  emailAttempt?: string
) {
  try {
    const timestamp = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Makassar" })
      .replace("T", " ");
    const adminName = admin || emailAttempt || "Unknown Source";

    await sql`
      INSERT INTO audit_logs (timestamp, admin, module, action, detail, ip_address, status)
      VALUES (${timestamp}, ${adminName}, 'Authentication', ${action}, ${detail}, ${ipAddress}, ${status})
    `;
  } catch (err) {
    console.error("[AUDIT_LOG_ERROR] Gagal mencatat log autentikasi:", err);
  }
}

// ==========================================
// KONFIGURASI NEXT-AUTH SULO-MIS
// ==========================================
const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@sulo.dev" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Ekstraksi IP dari Request Header (berguna jika di-deploy di Vercel/VPS)
        const ipAddress =
          (req?.headers as any)?.["x-forwarded-for"] ||
          (req?.headers as any)?.["x-real-ip"] ||
          "127.0.0.1";

        if (!credentials?.email || !credentials?.password) {
          await logAudit(
            "Unknown",
            "LOGIN_ATTEMPT",
            "Percobaan login ditolak karena input kredensial kosong.",
            "Failed",
            ipAddress,
            credentials?.email
          );
          return null; // Tolak akses
        }

        try {
          // 1. Query langsung ke tabel 'users' di Neon DB
          const result: any = await sql`
            SELECT id, name, email, password, role, status 
            FROM users 
            WHERE email = ${credentials.email}
            LIMIT 1
          `;

          // Ekstraksi baris aman untuk fleksibilitas driver Postgres/Neon
          const user = Array.isArray(result) ? result[0] : result?.rows?.[0];

          // 2. Jika email tidak ditemukan
          if (!user) {
            await logAudit(
              "System",
              "LOGIN_FAILED",
              `Gagal login: Email tidak terdaftar di sistem.`,
              "Failed",
              ipAddress,
              credentials.email
            );
            return null;
          }

          // 3. Verifikasi Password (Mendukung transisi Plaintext ke Bcrypt)
          // Secara default menggunakan bcrypt. Jika database Anda masih menggunakan plaintext sementara waktu, fallback ke perbandingan biasa.
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          const isPlaintextMatch = user.password === credentials.password; // TODO: Hapus baris ini jika semua password di DB sudah di-hash!

          if (!isPasswordValid && !isPlaintextMatch) {
            await logAudit(
              "System",
              "LOGIN_FAILED",
              `Gagal login: Kata sandi yang dimasukkan tidak valid.`,
              "Failed",
              ipAddress,
              credentials.email
            );
            return null;
          }

          // 4. Validasi: Status akun harus aktif
          if (user.status === "Inactive" || user.status === "Nonaktif") {
            console.warn(`Upaya login terblokir dari akun non-aktif: ${user.email}`);
            await logAudit(
              user.name,
              "LOGIN_BLOCKED",
              `Akses ditolak: Akun berstatus Inactive/Nonaktif.`,
              "Failed",
              ipAddress,
              user.email
            );
            return null;
          }

          // 5. Update waktu 'last_login' ke database secara Asynchronous (Tidak memblokir proses login)
          const now = new Date().toISOString();
          sql`UPDATE users SET last_login = ${now} WHERE id = ${user.id}`.catch(
            (err) => console.error("[DB_UPDATE_ERROR] Gagal update last_login:", err)
          );

          // 6. Catat aktivitas berhasil ke Audit Logs
          await logAudit(
            user.name,
            "LOGIN_SUCCESS",
            `Berhasil mengautentikasi dan masuk ke dalam sistem SULO-MIS.`,
            "Success",
            ipAddress,
            user.email
          );

          // 7. Kembalikan data user yang sukses login untuk JWT
          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH_ERROR] Kesalahan Database saat Otentikasi:", error);
          await logAudit(
            "System",
            "DB_ERROR",
            "Terjadi kesalahan internal server saat memproses autentikasi.",
            "Failed",
            ipAddress,
            credentials?.email
          );
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 45 * 60, // Proteksi auto-logout otomatis dalam 45 Menit (Sesuai SOP Keamanan SULO)
  },
  callbacks: {
    // Inject custom properties ke dalam JWT (Aman dari Tipe "Any")
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Inject JWT properties ke dalam Session Client
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Routing ke Custom Login UI
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };