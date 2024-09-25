import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

export default async function handler(req: any, res: any) {
  try {
    const { authorization } = req.headers;
    const { channel, message } = JSON.parse(req.body);
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const broadcaster = await apiClient.users.getUserByName(channel);
    if (!broadcaster) {
      return res.status(404).json({ status: false });
    }

    await apiClient.chat.sendChatMessage(broadcaster.id, message);

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
