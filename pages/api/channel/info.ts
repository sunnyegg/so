import { Channel } from "@/types/channel";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

import { ChannelCache } from "@/db/in-memory";

export default async function handler(req: any, res: any) {
  try {
    const { login } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (ChannelCache.has(login)) {
      return res.status(200).json({
        status: true,
        data: ChannelCache.get(login),
      });
    }

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return res.status(404).json({ status: false });
    }

    const channel = await apiClient.channels.getChannelInfoById(user.id);
    if (!channel) {
      return res.status(404).json({ status: false });
    }
    const followers = await user.getChannelFollowers();

    const data = {
      id: channel.id,
      login: channel.name,
      displayName: channel.displayName,
      gameName: channel.gameName,
      title: channel.title,
      profileImageUrl: user.profilePictureUrl,
      followers: followers.total,
    } as Channel;

    ChannelCache.set(login, data);

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}

setInterval(
  () => {
    console.log(`Clearing ChannelCache of ${ChannelCache.size} entries`);
    ChannelCache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
