import { Settings } from "@/types/settings";

import { decrypt } from "@/lib/encryption";
import { getUserInfoByLogin } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import supabase from "@/db/supabase";
import { SettingsCache } from "@/db/in-memory";
import { logger } from "@/lib/logger";

export type SettingDBData = {
  user_id: string;
  key: string;
  to_user_id: string;
  value: string;
  updated_at: string;
};

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const requestId = nanoid();
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    const body = await req.json();
    const { login, toLogin, settings } = body as {
      login: string;
      toLogin: string;
      settings: Settings;
    };

    // Log request
    logger.info("Save settings request", {
      requestId,
      userId,
      method: "POST",
      path: "/api/settings/save",
      params: { login, toLogin, settings }
    });

    if (!login || !toLogin || !settings) {
      const error = new Error("Missing required parameters");
      return CreateResponseApiError(error, 400);
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      const error = new Error("Unauthorized");
      return CreateResponseApiError(error, 401);
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    const user = await getUserInfoByLogin(decryptedToken, login);
    if (!user) {
      const error = new Error("User not found");
      logger.error("Get user by name failed", error, {
        requestId,
        userId,
        method: "POST",
        path: "/api/settings/save",
        params: { login }
      });
      return CreateResponseApiError(error, 404);
    }

    const toUser = await getUserInfoByLogin(decryptedToken, toLogin);
    if (!toUser) {
      const error = new Error("Target user not found");
      logger.error("Get target user by name failed", error, {
        requestId,
        userId,
        method: "POST",
        path: "/api/settings/save",
        params: { toLogin }
      });
      return CreateResponseApiError(error, 404);
    }

    const dbData: SettingDBData[] = [];
    Object.keys(settings).forEach((key) => {
      dbData.push({
        user_id: user.data[0].id,
        key,
        to_user_id: toUser.data[0].id,
        // @ts-ignore
        value: JSON.stringify(settings[key]),
        updated_at: new Date().toISOString()
      });
    });

    const createRes = await supabase().from("settings").upsert(dbData);
    if (createRes.status !== 200 && createRes.status !== 201) {
      const error = new Error(JSON.stringify(createRes));
      logger.error("Save settings to database failed", error, {
        requestId,
        userId,
        method: "POST",
        path: "/api/settings/save",
        params: { login, toLogin, settings }
      });
      return CreateResponseApiError(error, 500);
    }

    // Delete cached settings
    const key = `${login}-${toLogin}`;
    await SettingsCache.delete(key);

    // Cache settings
    await SettingsCache.set(key, settings);

    // Log success
    logger.info("Save settings request successful", {
      requestId,
      userId,
      method: "POST",
      path: "/api/settings/save",
      params: { login, toLogin }
    });

    return CreateResponseApiSuccess(null);
  } catch (error) {
    // Log error
    logger.error(
      "Save settings request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "POST",
        path: "/api/settings/save"
      }
    );

    if (error instanceof Error) {
      return CreateResponseApiError(error);
    }
    return CreateResponseApiError(new Error(JSON.stringify(error)));
  }
}
