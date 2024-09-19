import { Server } from "socket.io";

import { decrypt } from "@/lib/encryption";
import { NewChatClient } from "@/lib/twitch";

import NewSupabaseClient from "@/db/supabase";

import { ConnectedChatClients } from "@/const/global";

export default function handler(req: any, res: any) {
  try {
    const { login, channel } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const supabase = NewSupabaseClient();

    if (!res.socket.server.io) {
      const io = new Server(res.socket.server);
      res.socket.server.io = io;

      if (!ConnectedChatClients.has(login)) {
        const decryptedToken = decrypt(token);
        const chatClient = NewChatClient(decryptedToken, channel);
        ConnectedChatClients.set(login, new Map().set(channel, chatClient)); // unfinished

        if (!chatClient.isConnected) {
          chatClient.connect();
        }

        chatClient.onConnect(() => {
          console.log("connected to twitch chat");
        });
        chatClient.onDisconnect(() => {
          console.log("disconnected from twitch chat");
        });

        chatClient.onMessage(async (ch, user, text) => {
          // if (alreadyPresent.has(user)) {
          //   return;
          // }
          // alreadyPresent.set(user, true);

          const sb = await supabase.from("attendance").insert({
            name: user,
          });
          console.log(sb);

          io.emit(`chat-${ch}`, JSON.stringify({ user, text }));
        });
      }
    }

    res.end();
  } catch (error: any) {
    console.log(error);
  }
}
