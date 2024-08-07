import { AuthProvider } from "./auth";
import { ChatterProvider } from "./chatter";

export default function StoreProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <ChatterProvider>
        {children}
      </ChatterProvider>
    </AuthProvider>
  );
}