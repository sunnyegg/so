import { decrypt } from "@/lib/encryption";
import { NewAPIClient } from "@/lib/twitch";

import supabase from "@/db/supabase";

import { Chatter } from "@/types/chat";
import { BroadcastAttendance } from "@/db/in-memory";

type AttendanceDBData = {
  id: string;
  stream_id: string;
  login: string;
  display_name: string;
  followers: number;
  profile_image_url: string;
  present_at: string;
  created_at: string;
};

export default async function handler(req: any, res: any) {
  try {
    const { login, id } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);

    if (BroadcastAttendance.has(id)) {
      return res.status(200).json({
        status: true,
        data: BroadcastAttendance.get(id)!,
      });
    }

    const user = await apiClient.users.getUserByName(login);
    if (!user) {
      return res.status(404).json({ status: false });
    }

    const dbRes = await supabase()
      .from("attendance")
      .select("*")
      .eq("stream_id", id)
      .order("present_at", { ascending: true });

    if (dbRes.status !== 200) {
      console.log(dbRes);
      return res.status(500).json({ status: false });
    }

    const dbData: AttendanceDBData[] = dbRes.data || [];

    let outputData: Chatter[] = [];

    if (!dbData.length) {
      return res.status(404).json({ status: false });
    }

    for (const d of dbData) {
      outputData.push({
        id: d.id,
        login: d.login,
        displayName: d.display_name,
        followers: d.followers,
        profileImageUrl: d.profile_image_url,
        presentAt: d.present_at,
        lastSeenPlaying: "",
      });
    }

    BroadcastAttendance.set(id, outputData);

    return res.status(200).json({
      status: true,
      data: outputData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}
