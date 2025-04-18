import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { encrypt } from "@/lib/encryption";
import { exchangeCode, getUserInfo } from "@/lib/twitch";
import { Auth } from "@/types/auth";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const scope = searchParams.get("scope");

    if (!code || !scope) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    // Log the request
    logger.info("Login request", {
      requestId,
      method: "GET",
      path: "/api/auth/login",
      params: {
        code: code.substring(0, 4) + "...",
        scope
      }
    });

    // Exchange code for tokens using our new function
    const tokens = await exchangeCode(code);

    // Get user information
    const userInfo = await getUserInfo(tokens.access_token);

    if (!userInfo.data || userInfo.data.length === 0) {
      throw new Error("Failed to get user information");
    }

    // Encrypt tokens for storage
    const accessToken = encrypt(tokens.access_token);
    const refreshToken = encrypt(tokens.refresh_token);

    // Log success
    logger.info("Login successful", {
      requestId,
      method: "GET",
      path: "/api/auth/login",
      userId: userInfo.data[0].id
    });

    return CreateResponseApiSuccess({
      accessToken,
      refreshToken,
      expiredAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      user: {
        id: userInfo.data[0].id,
        login: userInfo.data[0].login,
        displayName: userInfo.data[0].display_name,
        profileImageUrl: userInfo.data[0].profile_image_url,
        broadcasterType: userInfo.data[0].broadcaster_type
      }
    } as Auth);
  } catch (error) {
    // Log error
    logger.error(
      "Login request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/auth/login"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
