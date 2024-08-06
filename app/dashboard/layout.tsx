import StoreProvider from "@/context/store";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <div className="mx-4 md:mx-32 my-8">
        {children}
      </div>
    </StoreProvider>
  )
}