import { Settings } from "@/types/settings";

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

export type SettingDBData = {
  user_id: string;
  key: string;
  to_user_id: string;
  value: string;
  updated_at: string;
};

export const runtime = "edge";

export default async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, toLogin, settings } = body as {
      login: string;
      toLogin: string;
      settings: Settings;
    };

    if (!login || !toLogin || !settings) {
      return CreateResponseApiError(
        new Error("Missing required parameters"),
        "app.api.settings.save.handler",
        400
      );
    }

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return CreateResponseApiError(
        new Error("Unauthorized"),
        "app.api.settings.save.handler",
        401
      );
    }

    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return CreateResponseApiError(
        new Error("User not found"),
        "app.api.settings.save.handler",
        404
      );
    }

    const toUser = await apiClient.users.getUserByName(toLogin);
    if (!toUser) {
      return CreateResponseApiError(
        new Error("Target user not found"),
        "app.api.settings.save.handler",
        404
      );
    }

    const dbData: SettingDBData[] = [];
    Object.keys(settings).forEach((key) => {
      dbData.push({
        user_id: user.id,
        key,
        to_user_id: toUser.id,
        // @ts-ignore
        value: JSON.stringify(settings[key]),
        updated_at: new Date().toISOString()
      });
    });

    const createRes = await supabase().from("settings").upsert(dbData);
    if (createRes.status !== 200 && createRes.status !== 201) {
      return CreateResponseApiError(
        new Error(JSON.stringify(createRes)),
        "app.api.settings.save.handler",
        500
      );
    }

    SettingsCache.set(`${login}-${toLogin}`, settings);

    return CreateResponseApiSuccess(null);
  } catch (error) {
    if (error instanceof Error) {
      return CreateResponseApiError(error, "app.api.settings.save.handler");
    }
    return CreateResponseApiError(
      new Error(JSON.stringify(error)),
      "app.api.settings.save.handler"
    );
  }
}
