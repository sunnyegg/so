'use client';

import StoreProvider from "@/context/store";

import { Toaster } from "@/components/ui/toaster";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <StoreProvider>
        {children}
      </StoreProvider>

      <Toaster />
    </div >
  );
}
