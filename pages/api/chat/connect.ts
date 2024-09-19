import { Server } from "socket.io";

import { decrypt } from "@/lib/encryption";
import { NewChatClient } from "@/lib/twitch";

export default function handler(req: any, res: any) {
  const { channel } = req.query;
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];

  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    const decryptedToken = decrypt(token);
    const chatClient = NewChatClient(decryptedToken, channel);

    io.on("connection", (socket) => {
      chatClient.connect();
      chatClient.onMessage((ch, user, text) => {
        const message = { user, text };
        socket.emit("chat", JSON.stringify(message));
      });

      socket.on("disconnect", () => {
        chatClient.quit();
      });
    });
  }

  res.end();
}
