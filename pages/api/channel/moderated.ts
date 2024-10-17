import { HelixModeratedChannel } from "@twurple/api";

import { ModeratedChannel } from "@/types/channel";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

import { ModeratedChannelsCache } from "@/db/in-memory";

export default async function handler(req: any, res: any) {
  try {
    const { userId } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (ModeratedChannelsCache.has(userId)) {
      return res.status(200).json({
        status: true,
        data: ModeratedChannelsCache.get(userId),
      });
    }

    const moderatedChannels =
      await apiClient.moderation.getModeratedChannels(userId);
    if (!moderatedChannels.data.length) {
      return res.status(404).json({ status: false });
    }

    const data = (await Promise.all(
      moderatedChannels.data.map(async (channel: HelixModeratedChannel) => {
        const profile = await channel.getBroadcaster();
        return {
          id: channel.id,
          login: channel.name,
          displayName: channel.displayName,
          profileImageUrl: profile.profilePictureUrl,
        };
      })
    )) as ModeratedChannel[];

    ModeratedChannelsCache.set(userId, data);

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
    console.log(
      `Clearing ModeratedChannelsCache of ${ModeratedChannelsCache.size} entries`
    );
    ModeratedChannelsCache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
