import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "SULO-MIS | Management Information System",
    template: "%s | SULO-MIS",
  },
  description:
    "Internal Management Information System for SULO.dev. Kelola infrastruktur, finance, proyek, dan SDM dalam satu ekosistem.",
  applicationName: "SULO-MIS",
  authors: [{ name: "SULO.dev Team", url: "https://sulo.dev" }],
  keywords: [
    "SULO-MIS",
    "Management Information System",
    "SULO.dev",
    "Internal Dashboard",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SULO-MIS | Management Information System",
    description: "Portal Manajemen Internal & Monitoring Operasional SULO.dev",
    siteName: "SULO-MIS",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans ${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-[#FC7A0B] selection:text-white transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}