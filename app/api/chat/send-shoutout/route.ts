import { decrypt } from "@/lib/encryption";
import { getUserInfoByLogin } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { logger } from "@/lib/logger";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const requestId = nanoid();
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      const error = new Error("Unauthorized");
      return CreateResponseApiError(error, 401);
    }

    const body = await req.json();
    const { from, to } = body;

    // Log request
    logger.info("Send shoutout request", {
      requestId,
      userId,
      method: "POST",
      path: "/api/chat/send-shoutout",
      params: { from, to }
    });

    if (!from || !to) {
      const error = new Error("Missing required parameters");
      return CreateResponseApiError(error, 400);
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    const broadcaster = await getUserInfoByLogin(decryptedToken, from);
    if (!broadcaster) {
      const error = new Error("Broadcaster not found");
      logger.error("Get broadcaster by name failed", error, {
        requestId,
        userId,
        method: "POST",
        path: "/api/chat/send-shoutout",
        params: { from }
      });
      return CreateResponseApiError(error, 404);
    }

    const user = await getUserInfoByLogin(decryptedToken, to);
    if (!user) {
      const error = new Error("Target user not found");
      logger.error("Get target user by name failed", error, {
        requestId,
        userId,
        method: "POST",
        path: "/api/chat/send-shoutout",
        params: { to }
      });
      return CreateResponseApiError(error, 404);
    }

    // await apiClient.chat.shoutoutUser(broadcaster.id, user.id);

    // Log success
    logger.info("Send shoutout request successful", {
      requestId,
      userId,
      method: "POST",
      path: "/api/chat/send-shoutout",
      params: { from, to }
    });

    return CreateResponseApiSuccess(null);
  } catch (error) {
    // Log error
    logger.error(
      "Send shoutout request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "POST",
        path: "/api/chat/send-shoutout"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
