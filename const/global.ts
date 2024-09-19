import { ChatClient } from "@twurple/chat";

export const AlreadyPresent = new Map<string, boolean>();
export const ConnectedChatClients = new Map<string, Map<string, ChatClient>>();
