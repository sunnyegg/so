import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

import { Broadcast } from "@/types/broadcast";

import supabase from "@/db/supabase";

type BroadcastDBData = {
  id: number;
  stream_id: string;
  broadcaster_id: string;
  broadcaster_name: string;
  title: string;
  game_name: string;
  start_date: string;
  created_at: string;
};

export default async function handler(req: any, res: any) {
  try {
    const { login } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return res.status(404).json({ status: false });
    }

    const dbRes = await supabase()
      .from("broadcasts")
      .select("*")
      .eq("broadcaster_id", user.id)
      .order("start_date", { ascending: false });

    if (dbRes.status !== 200) {
      console.log(dbRes);
      return res.status(500).json({ status: false });
    }

    const dbData: BroadcastDBData[] = dbRes.data || [];

    let outputData: Broadcast[] = [];

    if (!dbData.length) {
      return res.status(404).json({ status: false });
    }

    for (const d of dbData) {
      outputData.push({
        id: d.id,
        broadcasterId: d.broadcaster_id,
        streamId: d.stream_id,
        gameName: d.game_name,
        title: d.title,
        startDate: d.start_date,
        isLive: false,
      });
    }

    return res.status(200).json({
      status: true,
      data: outputData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
