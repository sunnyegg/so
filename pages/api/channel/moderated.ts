import { ModeratedChannel } from "@/types/channel";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import { HelixModeratedChannel } from "@twurple/api";

const Cache = new Map<string, ModeratedChannel[]>();

export default async function handler(req: any, res: any) {
  try {
    const { userId } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (Cache.has(userId)) {
      return res.status(200).json({
        status: true,
        data: Cache.get(userId),
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

    Cache.set(userId, data);

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
    console.log(`Clearing moderated channels for ${Cache.size} cache entries`);
    Cache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
