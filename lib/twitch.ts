import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";

const existingClients = new Map<string, ApiClient>();
const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;

export const NewAPIClient = (accessToken: string): ApiClient => {
  if (!existingClients.has(accessToken)) {
    const authProvider = new StaticAuthProvider(CLIENT_ID, accessToken);
    existingClients.set(accessToken, new ApiClient({ authProvider }));
  }

  return existingClients.get(accessToken)!;
};

// every hour, reset existing clients
setInterval(
  () => {
    existingClients.clear();
  },
  1000 * 60 * 60
);
