import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

type Channel = {
  name: string;
  gameName: string;
  title: string;
  profileImageUrl: string;
};

export default async function handler(req: any, res: any) {
  try {
    const { login, token } = req.query;
    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
    const decryptedToken = decrypt(token);

    const apiClient = NewAPIClient(CLIENT_ID, decryptedToken);

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return res.status(404).json({ status: false });
    }

    const channel = await apiClient.channels.getChannelInfoById(user.id);
    if (!channel) {
      return res.status(404).json({ status: false });
    }

    const data = {
      name: channel.name,
      gameName: channel.gameName,
      title: channel.title,
      profileImageUrl: user.profilePictureUrl,
    } as Channel;

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
