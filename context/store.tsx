import { ErrorProvider } from "./error";
import { SuccessProvider } from "./success";

export default function StoreProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ErrorProvider>
      <SuccessProvider>
        {children}
      </SuccessProvider>
    </ErrorProvider>
  );
}