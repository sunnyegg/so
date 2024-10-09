import supabase from "@/db/supabase";

import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

import { Stream } from "@/types/stream";

export default async function handler(req: any, res: any) {
  try {
    const { login } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    const currentBroadcast = await apiClient.streams.getStreamByUserName(login);
    if (!currentBroadcast) {
      return res.status(404).json({ status: false });
    }

    // check db
    const dbRes = await supabase()
      .from("broadcasts")
      .select("*")
      .eq("streamId", currentBroadcast.id);

    // if not found, create
    if (dbRes.status === 404) {
      const createRes = await supabase().from("broadcasts").insert({
        streamId: currentBroadcast.id,
        broadcasterId: currentBroadcast.userId,
        broadcasterName: currentBroadcast.userName,
        gameName: currentBroadcast.gameName,
        title: currentBroadcast.title,
        startDate: currentBroadcast.startDate.toISOString(),
      });
      if (createRes.status !== 200) {
        console.log(createRes.error);
        return res.status(500).json({ status: false });
      }
    }

    if (dbRes.status !== 200) {
      console.log(dbRes.error);
      return res.status(500).json({ status: false });
    }

    const data = {
      id: dbRes.data?.[0].id,
      streamId: dbRes.data?.[0].id,
      gameName: dbRes.data?.[0].gameName,
      title: dbRes.data?.[0].title,
      startDate: dbRes.data?.[0].startDate.toISOString(),
      isLive: true,
    } as Stream;

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
