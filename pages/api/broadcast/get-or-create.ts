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
      .eq("stream_id", currentBroadcast.id);

    if (dbRes.status !== 200) {
      console.log(dbRes.error);
      return res.status(500).json({ status: false });
    }

    let outputData: Stream = {
      streamId: "",
      gameName: "",
      title: "",
      startDate: "",
      isLive: false,
    };

    // if found, use db data
    if (dbRes.status === 200 && dbRes.count) {
      outputData = {
        streamId: dbRes.data[0].stream_id,
        gameName: dbRes.data[0].game_name,
        title: dbRes.data[0].title,
        startDate: dbRes.data[0].start_date.toISOString(),
        isLive: true,
      };
    }

    // if not found, create
    if (dbRes.status === 200 && !dbRes.count) {
      outputData = {
        streamId: currentBroadcast.id,
        gameName: currentBroadcast.gameName,
        title: currentBroadcast.title,
        startDate: currentBroadcast.startDate.toISOString(),
        isLive: true,
      };

      const createRes = await supabase().from("broadcasts").insert({
        stream_id: outputData.streamId,
        broadcaster_id: currentBroadcast.userId,
        broadcaster_name: currentBroadcast.userName,
        game_name: outputData.gameName,
        title: outputData.title,
        start_date: outputData.startDate,
      });
      if (createRes.status !== 200) {
        console.log(createRes.error);
        return res.status(500).json({ status: false });
      }
    }

    return res.status(200).json({
      status: true,
      data: outputData,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
