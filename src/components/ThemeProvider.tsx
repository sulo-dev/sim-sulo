"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * ThemeProvider (Client Component Wrapper)
 * 
 * Mengapa komponen ini dipisah?
 * Next.js App Router merekomendasikan RootLayout tetap sebagai Server Component.
 * Karena `next-themes` membutuhkan akses ke DOM/Client (window.localStorage), 
 * kita membungkusnya di dalam komponen "use client" ini.
 */
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}