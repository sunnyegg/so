import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

import supabase from "@/db/supabase";
import { SettingsCache } from "@/db/in-memory";

import { Settings } from "@/types/settings";

import { SettingDBData } from "./save";

export default async function handler(req: any, res: any) {
  try {
    const { login, toLogin } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (SettingsCache.has(`${login}-${toLogin}`)) {
      return res.status(200).json({
        status: true,
        data: SettingsCache.get(`${login}-${toLogin}`),
      });
    }

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return res.status(404).json({ status: false });
    }

    const toUser = await apiClient.users.getUserByName(toLogin);
    if (!toUser) {
      return res.status(404).json({ status: false });
    }

    const dbRes = await supabase()
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("to_user_id", toUser.id);

    if (dbRes.status !== 200) {
      console.log(dbRes);
      return res.status(500).json({ status: false });
    }

    const dbData: SettingDBData[] = dbRes.data || [];

    let outputData: Settings = {
      autoSo: false,
      autoSoDelay: 0,
      blacklistUsernames: "",
      blacklistWords: "",
      raidPriority: true,
    };

    if (dbRes.status === 200 && dbData.length) {
      for (const data of dbData) {
        // @ts-ignore
        outputData[data.key] = JSON.parse(data.value);
      }
    }

    SettingsCache.set(`${login}-${toLogin}`, outputData);

    return res.status(200).json({
      status: true,
      data: outputData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}

setInterval(
  () => {
    console.log(`Clearing SettingsCache of ${SettingsCache.size} entries`);
    SettingsCache.clear();
  },
  1000 * 60 * 60 * 24
); // every 24 hours
