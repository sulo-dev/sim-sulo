import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "next-themes"; // Tambahkan ini

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SULO-MIS | Management Information System",
  description: "Internal Management Information System for SULO.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      {/* transisi warna bg agar pergantian tema mulus */}
      <body
        className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar dipisah ke komponen mandiri */}
              <Sidebar />

              {/* Area Konten Utama */}
              <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 transition-colors duration-300">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
