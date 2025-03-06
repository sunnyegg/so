import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";
import {
  CreateResponseApiError,
  CreateResponseApiSuccess,
  log
} from "@/lib/utils";
import { NextRequest } from "next/server";

import supabase from "@/db/supabase";
import { SettingsCache } from "@/db/in-memory";

import { Settings } from "@/types/settings";

import { SettingDBData } from "../save/route";

export const runtime = "edge";

export default async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");
    const toLogin = searchParams.get("toLogin");

    if (!login || !toLogin) {
      return CreateResponseApiError(
        new Error("Missing required parameters"),
        "app.api.settings.list.handler",
        400
      );
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.settings.list.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (SettingsCache.has(`${login}-${toLogin}`)) {
      return CreateResponseApiSuccess(SettingsCache.get(`${login}-${toLogin}`));
    }

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return CreateResponseApiError(
        new Error("User not found"),
        "app.api.settings.list.handler",
        404
      );
    }

    const toUser = await apiClient.users.getUserByName(toLogin);
    if (!toUser) {
      return CreateResponseApiError(
        new Error("Target user not found"),
        "app.api.settings.list.handler",
        404
      );
    }

    const dbRes = await supabase()
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("to_user_id", toUser.id);

    if (dbRes.status !== 200) {
      return CreateResponseApiError(
        new Error(JSON.stringify(dbRes)),
        "app.api.settings.list.handler",
        500
      );
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

    SettingsCache.set(`${login}-${toLogin}`, outputData);

    return CreateResponseApiSuccess(outputData);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error, "app.api.settings.list.handler");
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.settings.list.handler"
    );
  }
}

setInterval(
  () => {
    log(
      "info",
      "app.api.settings.list.setInterval",
      `Clearing SettingsCache of ${SettingsCache.size} entries`
    );
    SettingsCache.clear();
  },
  1000 * 60 * 60 * 24
); // every 24 hours
