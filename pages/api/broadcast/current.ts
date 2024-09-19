import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

type Broadcast = {
  gameName: string;
  title: string;
  startDate: string;
};

export default async function handler(req: any, res: any) {
  try {
    const { login } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const currentBroadcast = await apiClient.streams.getStreamByUserName(login);
    if (!currentBroadcast) {
      return res.status(404).json({ status: false });
    }

    const data = {
      gameName: currentBroadcast.gameName,
      title: currentBroadcast.title,
      startDate: currentBroadcast.startDate.toISOString(),
    } as Broadcast;

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
