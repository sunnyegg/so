import { decrypt } from "@/lib/encryption";
import { SettingsCache } from "@/db/in-memory";

export default async function handler(req: any, res: any) {
  try {
    const { login } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    if (SettingsCache.has(login)) {
      return res.status(200).json({
        status: true,
        data: SettingsCache.get(login),
      });
    }

    // TODO: get from supabase
    const dummy = {
      autoSo: false,
      autoSoDelay: 0,
      blacklistUsernames: "",
      blacklistWords: "",
    };

    SettingsCache.set(login, dummy);

    return res.status(200).json({
      status: true,
      data: dummy,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}

setInterval(
  () => {
    console.log(
      `Clearing SettingsCache of ${SettingsCache.size} cache entries`
    );
    SettingsCache.clear();
  },
  1000 * 60 * 5
); // every 5 minutes
