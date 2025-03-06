import { HelixModeratedChannel } from "@twurple/api";

import { ModeratedChannel } from "@/types/channel";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import {
  CreateResponseApiError,
  CreateResponseApiSuccess,
  log
} from "@/lib/utils";
import { NextRequest } from "next/server";

import { ModeratedChannelsCache } from "@/db/in-memory";

export const runtime = "edge";

export default async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return CreateResponseApiError(
        new Error("Missing userId parameter"),
        "app.api.channel.moderated.handler",
        400
      );
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.channel.moderated.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (ModeratedChannelsCache.has(userId)) {
      return CreateResponseApiSuccess(ModeratedChannelsCache.get(userId));
    }

    const moderatedChannels =
      await apiClient.moderation.getModeratedChannels(userId);
    if (!moderatedChannels.data.length) {
      return CreateResponseApiError(
        new Error("No moderated channels found"),
        "app.api.channel.moderated.handler",
        404
      );
    }

    const data = (await Promise.all(
      moderatedChannels.data.map(async (channel: HelixModeratedChannel) => {
        const profile = await channel.getBroadcaster();
        return {
          id: channel.id,
          login: channel.name,
          displayName: channel.displayName,
          profileImageUrl: profile.profilePictureUrl
        };
      })
    )) as ModeratedChannel[];

    ModeratedChannelsCache.set(userId, data);

    return CreateResponseApiSuccess(data);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error, "app.api.channel.moderated.handler");
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.channel.moderated.handler"
    );
  }
}

setInterval(
  () => {
    log(
      "info",
      "app.api.channel.moderated.handler",
      `Clearing ModeratedChannelsCache of ${ModeratedChannelsCache.size} entries`
    );
    ModeratedChannelsCache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
