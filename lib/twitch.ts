import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";

const NewAPIClient = (clientId: string, accessToken: string): ApiClient => {
  const authProvider = new StaticAuthProvider(clientId, accessToken);
  return new ApiClient({ authProvider });
};

export { NewAPIClient };
