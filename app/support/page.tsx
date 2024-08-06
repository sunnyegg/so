'use client';

import StoreProvider from "@/context/store";
import TopBar from "@/components/common/topbar";

export default function SupportPage() {
  return (
    <StoreProvider>
      <div className="mx-4 md:mx-32 my-8">
        <TopBar />

        <div>Support</div>
      </div>
    </StoreProvider>
  )
}