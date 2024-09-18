import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";

const existingClients = new Map<string, ApiClient>();

const NewAPIClient = (clientId: string, accessToken: string): ApiClient => {
  if (!existingClients.has(accessToken)) {
    const authProvider = new StaticAuthProvider(clientId, accessToken);
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

export { NewAPIClient };
