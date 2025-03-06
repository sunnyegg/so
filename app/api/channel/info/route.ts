import { Channel } from "@/types/channel";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { ChannelCache } from "@/db/in-memory";
import { logger } from "@/lib/logger";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");

    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    // Log request
    logger.info("Get channel info request", {
      requestId,
      userId: userId || undefined,
      method: "GET",
      path: "/api/channel/info",
      params: { login }
    });

    if (!login) {
      const error = new Error("Missing login parameter");
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

    if (ChannelCache.has(login)) {
      logger.info("Get channel info request successful (cached)", {
        requestId,
        userId: userId || undefined,
        method: "GET",
        path: "/api/channel/info",
        params: { login }
      });
      return CreateResponseApiSuccess(ChannelCache.get(login));
    }

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      const error = new Error("User not found");
      logger.error("Get user by name failed", error, {
        requestId,
        userId: userId || undefined,
        method: "GET",
        path: "/api/channel/info",
        params: { login }
      });
      return CreateResponseApiError(error, 404);
    }

    const channel = await apiClient.channels.getChannelInfoById(user.id);
    if (!channel) {
      const error = new Error("Channel not found");
      logger.error("Get channel info by id failed", error, {
        requestId,
        userId: userId || undefined,
        method: "GET",
        path: "/api/channel/info",
        params: { login, userId: user.id }
      });
      return CreateResponseApiError(error, 404);
    }
    const followers = await user.getChannelFollowers();

    const data = {
      id: channel.id,
      login: channel.name,
      displayName: channel.displayName,
      gameName: channel.gameName,
      title: channel.title,
      profileImageUrl: user.profilePictureUrl,
      followers: followers.total
    } as Channel;

    ChannelCache.set(login, data);

    // Log success
    logger.info("Get channel info request successful", {
      requestId,
      userId: userId || undefined,
      method: "GET",
      path: "/api/channel/info",
      params: { login }
    });

    return CreateResponseApiSuccess(data);
  } catch (error) {
    // Log error
    logger.error(
      "Get channel info request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/channel/info"
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
    logger.info("Clearing ChannelCache", {
      message: `Clearing ChannelCache of ${ChannelCache.size} entries`
    });
    ChannelCache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
