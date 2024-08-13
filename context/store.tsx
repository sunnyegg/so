import { AuthProvider } from "./auth";
import { ChatterProvider } from "./chatter";
import { ShoutoutProvider } from "./shoutout";
import { StreamProvider } from "./stream";
import { WebsocketProvider } from "./websocket";

export default function StoreProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <ChatterProvider>
        <StreamProvider>
          <ShoutoutProvider>
            <WebsocketProvider>
              {children}
            </WebsocketProvider>
          </ShoutoutProvider>
        </StreamProvider>
      </ChatterProvider>
    </AuthProvider>
  );
}