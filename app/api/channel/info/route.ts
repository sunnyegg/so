import { Channel } from "@/types/channel";

import { decrypt } from "@/lib/encryption";
import {
  getChannelFollowers,
  getChannelInfoById,
  getUserInfoByLogin
} from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { ChannelCache } from "@/db/in-memory";
import { logger } from "@/lib/logger";

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

    const cachedData = await ChannelCache.get(login);
    if (cachedData) {
      logger.info("Get channel info request successful (cached)", {
        requestId,
        userId: userId || undefined,
        method: "GET",
        path: "/api/channel/info",
        params: { login }
      });
      return CreateResponseApiSuccess(cachedData);
    }

    const user = await getUserInfoByLogin(decryptedToken, login);
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

    const channel = await getChannelInfoById(decryptedToken, user.data[0].id);
    if (!channel) {
      const error = new Error("Channel not found");
      logger.error("Get channel info by id failed", error, {
        requestId,
        userId: userId || undefined,
        method: "GET",
        path: "/api/channel/info",
        params: { login, userId: user.data[0].id }
      });
      return CreateResponseApiError(error, 404);
    }
    const followers = await getChannelFollowers(
      decryptedToken,
      user.data[0].id
    );

    const data = {
      id: channel.data[0].broadcaster_id,
      login: channel.data[0].broadcaster_login,
      displayName: channel.data[0].broadcaster_name,
      gameName: channel.data[0].game_name,
      title: channel.data[0].title,
      profileImageUrl: user.data[0].profile_image_url,
      followers: followers.total
    } as Channel;

    await ChannelCache.set(login, data);

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
  async () => {
    logger.info("Clearing ChannelCache", {
      message: `Clearing ChannelCache of ${await ChannelCache.size()} entries`
    });
    await ChannelCache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
