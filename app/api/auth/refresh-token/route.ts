import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { decrypt, encrypt } from "@/lib/encryption";
import { refreshAccessToken } from "@/lib/twitch";
import { Auth } from "@/types/auth";

export async function POST(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const decryptedToken = decrypt(token);

    // Log request
    logger.info("Refresh token request", {
      requestId,
      userId,
      method: "POST",
      path: "/api/auth/refresh-token"
    });

    // Use our new refresh token function
    const tokens = await refreshAccessToken(decryptedToken);

    // Encrypt new tokens
    const accessToken = encrypt(tokens.access_token);
    const refreshToken = encrypt(tokens.refresh_token);

    // Log success
    logger.info("Refresh token request successful", {
      requestId,
      userId,
      method: "POST",
      path: "/api/auth/refresh-token"
    });

    return CreateResponseApiSuccess({
      accessToken,
      refreshToken,
      expiredAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    } as Auth);
  } catch (error) {
    // Log error
    logger.error(
      "Refresh token request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "POST",
        path: "/api/auth/refresh-token"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
