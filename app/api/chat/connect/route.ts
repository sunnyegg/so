import { decrypt } from "@/lib/encryption";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { logger } from "@/lib/logger";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const requestId = nanoid();
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    // Log request
    logger.info("Chat connect request", {
      requestId,
      userId,
      method: "GET",
      path: "/api/chat/connect"
    });

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      const error = new Error("Unauthorized");
      return CreateResponseApiError(error, 401);
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    // Log success
    logger.info("Chat connect request successful", {
      requestId,
      userId,
      method: "GET",
      path: "/api/chat/connect"
    });

    return CreateResponseApiSuccess(decryptedToken);
  } catch (error) {
    // Log error
    logger.error(
      "Chat connect request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/chat/connect"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
