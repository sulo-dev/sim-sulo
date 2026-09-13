import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  // TAMBAHKAN BARIS INI: Wajib ada untuk JWT
  secret: process.env.NEXTAUTH_SECRET, 
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@sulo.dev" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // MOCK DATABASE LOGIC (Sementara)
        const mockAdmin = {
          id: "1",
          name: "Admin SULO",
          email: "admin@sulo.dev",
          password: "admin" // Password sementaranya adalah: admin
        };

        if (credentials?.email === mockAdmin.email && credentials?.password === mockAdmin.password) {
          return { id: mockAdmin.id, name: mockAdmin.name, email: mockAdmin.email };
        }
        
        return null; // Jika salah, kembalikan null (Login gagal)
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 45 * 60, // Proteksi auto-logout 45 menit sesuai PRD
  },
  pages: {
    signIn: '/login', // Arahkan halaman login bawaan ke halaman kustom kita
  }
});

export { handler as GET, handler as POST };