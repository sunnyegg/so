import { Settings } from "@/types/settings";

import { decrypt } from "@/lib/encryption";
import { SettingsCache } from "@/db/in-memory";

export default async function handler(req: any, res: any) {
  try {
    const { login, settings }: { login: string; settings: Settings } =
      JSON.parse(req.body);
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    // TODO: insert to supabase
    const data = {
      ...settings,
    };

    console.log(data);

    SettingsCache.set(login, data);

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
