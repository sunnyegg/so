import { Settings } from "@/types/settings";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

import supabase from "@/db/supabase";
import { SettingsCache } from "@/db/in-memory";

export type SettingDBData = {
  user_id: string;
  key: string;
  to_user_id: string;
  value: string;
  updated_at: string;
};

export default async function handler(req: any, res: any) {
  try {
    const {
      login,
      toLogin,
      settings,
    }: { login: string; toLogin: string; settings: Settings } = JSON.parse(
      req.body
    );
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return res.status(404).json({ status: false });
    }

    const toUser = await apiClient.users.getUserByName(toLogin);
    if (!toUser) {
      return res.status(404).json({ status: false });
    }

    const dbData: SettingDBData[] = [];
    Object.keys(settings).forEach((key) => {
      dbData.push({
        user_id: user.id,
        key,
        to_user_id: toUser.id,
        // @ts-ignore
        value: JSON.stringify(settings[key]),
        updated_at: new Date().toISOString(),
      });
    });

    const createRes = await supabase().from("settings").upsert(dbData);
    if (createRes.status !== 200 && createRes.status !== 201) {
      console.log(createRes);
      return res.status(500).json({ status: false });
    }

    SettingsCache.set(`${login}-${toLogin}`, settings);

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
