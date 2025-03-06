import { HelixModeratedChannel } from "@twurple/api";

import { ModeratedChannel } from "@/types/channel";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { ModeratedChannelsCache } from "@/db/in-memory";
import { logger } from "@/lib/logger";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const headerUserId = req.headers.get("x-user-id");
    if (!headerUserId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    // Log request
    logger.info("Get moderated channels request", {
      requestId,
      userId: headerUserId,
      method: "GET",
      path: "/api/channel/moderated",
      params: { userId }
    });

    if (!userId) {
      const error = new Error("Missing userId parameter");
      return CreateResponseApiError(error, 400);
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      const error = new Error("Unauthorized");
      return CreateResponseApiError(error, 401);
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (ModeratedChannelsCache.has(userId)) {
      logger.info("Get moderated channels request successful (cached)", {
        requestId,
        userId: headerUserId,
        method: "GET",
        path: "/api/channel/moderated",
        params: { userId }
      });
      return CreateResponseApiSuccess(ModeratedChannelsCache.get(userId));
    }

    const moderatedChannels =
      await apiClient.moderation.getModeratedChannels(userId);
    if (!moderatedChannels.data.length) {
      const error = new Error("No moderated channels found");
      logger.error("Get moderated channels request failed", error, {
        requestId,
        userId: headerUserId,
        method: "GET",
        path: "/api/channel/moderated",
        params: { userId }
      });
      return CreateResponseApiError(error, 404);
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

    // Log success
    logger.info("Get moderated channels request successful", {
      requestId,
      userId: headerUserId,
      method: "GET",
      path: "/api/channel/moderated",
      params: { userId }
    });

    return CreateResponseApiSuccess(data);
  } catch (error) {
    // Log error
    logger.error(
      "Get moderated channels request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/channel/moderated"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}

setInterval(
  () => {
    logger.info("Clearing ModeratedChannelsCache", {
      message: `Clearing ModeratedChannelsCache of ${ModeratedChannelsCache.size} entries`
    });
    ModeratedChannelsCache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
