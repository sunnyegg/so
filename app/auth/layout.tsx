"use client";

import { Suspense } from "react";

import { Toaster } from "@/components/ui/toaster";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      {children}

      <Toaster />
    </Suspense>
  );
}
