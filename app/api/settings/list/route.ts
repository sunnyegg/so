import { decrypt } from "@/lib/encryption";
import { getUserInfoByLogin } from "@/lib/twitch";
import { CreateResponseApiError, CreateResponseApiSuccess } from "@/lib/utils";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

import supabase from "@/db/supabase";
import { SettingsCache } from "@/db/in-memory";
import { logger } from "@/lib/logger";

import { Settings } from "@/types/settings";

import { SettingDBData } from "../save/route";

export async function GET(req: NextRequest) {
  const requestId = nanoid();
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");
    const toLogin = searchParams.get("toLogin");

    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return CreateResponseApiError(new Error("Unauthorized"), 401);
    }

    // Log request
    logger.info("List settings request", {
      requestId,
      userId,
      method: "GET",
      path: "/api/settings/list",
      params: { login, toLogin }
    });

    if (!login || !toLogin) {
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

    const cachedSettings = await SettingsCache.get(`${login}-${toLogin}`);
    if (cachedSettings) {
      logger.info("List settings request successful (cached)", {
        requestId,
        userId,
        method: "GET",
        path: "/api/settings/list",
        params: { login, toLogin }
      });
      return CreateResponseApiSuccess(cachedSettings);
    }

    const user = await getUserInfoByLogin(decryptedToken, login);
    if (!user) {
      const error = new Error("User not found");
      logger.error("Get user by name failed", error, {
        requestId,
        userId,
        method: "GET",
        path: "/api/settings/list",
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
        method: "GET",
        path: "/api/settings/list",
        params: { toLogin }
      });
      return CreateResponseApiError(error, 404);
    }

    const dbRes = await supabase()
      .from("settings")
      .select("*")
      .eq("user_id", user.data[0].id)
      .eq("to_user_id", toUser.data[0].id);

    if (dbRes.status !== 200) {
      const error = new Error(JSON.stringify(dbRes));
      logger.error("Get settings by user ids failed", error, {
        requestId,
        userId,
        method: "GET",
        path: "/api/settings/list",
        params: { userId: user.data[0].id, toUserId: toUser.data[0].id }
      });
      return CreateResponseApiError(error, 500);
    }

    const dbData: SettingDBData[] = dbRes.data || [];

    let outputData: Settings = {
      autoSo: false,
      autoSoDelay: 0,
      blacklistUsernames: "",
      blacklistWords: "",
      raidPriority: true
    };

    if (dbData.length) {
      for (const data of dbData) {
        // @ts-ignore
        outputData[data.key] = JSON.parse(data.value);
      }
    }

    // Cache settings
    const cacheKey = `${login}-${toLogin}`;
    await SettingsCache.set(cacheKey, outputData);

    // Log success
    logger.info("List settings request successful", {
      requestId,
      userId,
      method: "GET",
      path: "/api/settings/list",
      params: { login, toLogin }
    });

    return CreateResponseApiSuccess(outputData);
  } catch (error) {
    // Log error
    logger.error(
      "List settings request failed",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "GET",
        path: "/api/settings/list"
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
    logger.info("Clearing SettingsCache", {
      message: `Clearing SettingsCache of ${await SettingsCache.size()} entries`
    });
    await SettingsCache.clear();
  },
  1000 * 60 * 60 * 24
); // every 24 hours
