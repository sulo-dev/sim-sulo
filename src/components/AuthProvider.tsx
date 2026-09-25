"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

/**
 * AuthProvider (Client Component Boundary)
 * 
 * Mengapa komponen ini diperlukan?
 * NextAuth membutuhkan React Context (`SessionProvider`) untuk mendistribusikan data
 * sesi ke seluruh aplikasi. Karena React Context tidak didukung di Server Components,
 * kita membungkusnya di dalam komponen "use client" ini agar `RootLayout` utama 
 * (app/layout.tsx) dapat tetap menjadi Server Component yang cepat dan ringan.
 */
export default function AuthProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}