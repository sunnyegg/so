import { Channel } from "@/types/channel";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import {
  CreateResponseApiError,
  CreateResponseApiSuccess,
  log
} from "@/lib/utils";
import { NextRequest } from "next/server";

import { ChannelCache } from "@/db/in-memory";

export const runtime = "edge";

export default async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");

    if (!login) {
      return CreateResponseApiError(
        new Error("Missing login parameter"),
        "app.api.channel.info.handler",
        400
      );
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.channel.info.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (ChannelCache.has(login)) {
      return CreateResponseApiSuccess(ChannelCache.get(login));
    }

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return CreateResponseApiError(
        new Error("User not found"),
        "app.api.channel.info.handler",
        404
      );
    }

    const channel = await apiClient.channels.getChannelInfoById(user.id);
    if (!channel) {
      return CreateResponseApiError(
        new Error("Channel not found"),
        "app.api.channel.info.handler",
        404
      );
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

    return CreateResponseApiSuccess(data);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error, "app.api.channel.info.handler");
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.channel.info.handler"
    );
  }
}

setInterval(
  () => {
    log(
      "info",
      "app.api.channel.info.setInterval",
      `Clearing ChannelCache of ${ChannelCache.size} entries`
    );
    ChannelCache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
