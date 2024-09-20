import TwitchProvider from "./twitch";

export default function StoreProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TwitchProvider>{children}</TwitchProvider>;
}
