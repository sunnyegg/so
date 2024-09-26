import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { StaticAuthProvider } from "@twurple/auth";
import { EventSubWsListener } from "@twurple/eventsub-ws";

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
const existingApiClients = new Map<string, ApiClient>();
const existingChatClients = new Map<string, ChatClient>();
const existingEventSubWsClients = new Map<string, EventSubWsListener>();

export const NewAPIClient = (accessToken: string): ApiClient => {
  if (!existingApiClients.has(accessToken)) {
    const authProvider = new StaticAuthProvider(CLIENT_ID, accessToken);
    existingApiClients.set(accessToken, new ApiClient({ authProvider }));
  }

  return existingApiClients.get(accessToken)!;
};

export const NewChatClient = (
  accessToken: string,
  channel: string
): ChatClient => {
  if (!existingChatClients.has(accessToken)) {
    const authProvider = new StaticAuthProvider(CLIENT_ID, accessToken);
    existingChatClients.set(
      accessToken,
      new ChatClient({ authProvider, channels: [channel] })
    );
  }

  return existingChatClients.get(accessToken)!;
};

export const NewEventSubWsClient = (accessToken: string) => {
  if (!existingEventSubWsClients.has(accessToken)) {
    const apiClient = NewAPIClient(accessToken);
    existingEventSubWsClients.set(
      accessToken,
      new EventSubWsListener({ apiClient })
    );
  }

  return existingEventSubWsClients.get(accessToken)!;
};

// every hour, reset existing clients
setInterval(
  () => {
    existingApiClients.clear();
    existingChatClients.clear();
    existingEventSubWsClients.clear();
  },
  1000 * 60 * 60
);
