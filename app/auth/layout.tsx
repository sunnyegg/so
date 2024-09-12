"use client";

import { Toaster } from "@/components/ui/toaster";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}

      <Toaster />
    </div>
  );
}
