import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
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
    const { channel, message } = body;

    // Log request
    logger.info("Send chat message request", {
      requestId,
      userId,
      method: "POST",
      path: "/api/chat/send-message",
      params: { channel, message }
    });

    if (!channel || !message) {
      const error = new Error("Missing required parameters");
      return CreateResponseApiError(error, 400);
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const broadcaster = await apiClient.users.getUserByName(channel);
    if (!broadcaster) {
      const error = new Error("Channel not found");
      logger.error("Get user by name failed", error, {
        requestId,
        userId,
        method: "POST",
        path: "/api/chat/send-message",
        params: { channel }
      });
      return CreateResponseApiError(error, 404);
    }

    await apiClient.chat.sendChatMessage(broadcaster.id, message);

    // Log success
    logger.info("Send chat message request successful", {
      requestId,
      userId,
      method: "POST",
      path: "/api/chat/send-message",
      params: { channel }
    });

    return CreateResponseApiSuccess(null);
  } catch (error) {
    // Log error
    logger.error(
      "Send chat message request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "POST",
        path: "/api/chat/send-message"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
