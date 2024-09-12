"use client";

import StoreProvider from "@/context/store";
import TopBar from "@/components/common/topbar";

export default function SupportPage() {
  return (
    <StoreProvider>
      <div className="mx-4 my-8 md:mx-32">
        <TopBar />

        <div>Support</div>
      </div>
    </StoreProvider>
  );
}
