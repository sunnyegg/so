import { AuthProvider } from "./auth";
import { ChannelProvider } from "./channel";
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
      <ChannelProvider>
        <ChatterProvider>
          <StreamProvider>
            <ShoutoutProvider>
              <WebsocketProvider>
                {children}
              </WebsocketProvider>
            </ShoutoutProvider>
          </StreamProvider>
        </ChatterProvider>
      </ChannelProvider>
    </AuthProvider>
  );
}