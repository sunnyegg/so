import supabase from "@/db/supabase";
import { AlreadyPresent, BroadcastAttendance } from "@/db/in-memory";

import { decrypt } from "@/lib/encryption";
import { NewAttendanceQueue } from "@/lib/queue";
import { NewAPIClient } from "@/lib/twitch";

import { Attendance } from "@/types/broadcast";
import { Chatter } from "@/types/chat";

type AttendanceDBData = {
  stream_id: string;
  login: string;
  display_name: string;
  followers: number;
  profile_image_url: string;
  present_at: string;
};

export default async function handler(req: any, res: any) {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);
    const apiClient = NewAPIClient(decryptedToken);
    const { streamId, broadcasterId, chatters } = JSON.parse(
      req.body
    ) as Attendance;

    const currentBroadcast =
      await apiClient.streams.getStreamByUserId(broadcasterId);
    if (!currentBroadcast) {
      console.log("no stream", broadcasterId);
      return res.status(404).json({ status: false });
    }

    if (currentBroadcast.id !== streamId) {
      console.log(currentBroadcast, req.body);
      return res.status(400).json({ status: false });
    }

    if (!AlreadyPresent.get(streamId)) {
      // check db
      const dbRes = await supabase()
        .from("attendance")
        .select("*")
        .eq("stream_id", streamId);

      if (dbRes.status !== 200) {
        console.log(dbRes);
        return res.status(500).json({ status: false });
      }

      let dbData: Chatter[] = [];
      if (dbRes.status === 200 && dbRes.data?.length) {
        dbData = dbRes.data.map((item) => {
          return {
            ...item,
            id: "",
            lastSeenPlaying: "",
          } as Chatter;
        });
      }

      AlreadyPresent.set(streamId, dbData);
    }

    let alreadyPresentData = AlreadyPresent.get(streamId)!;

    // transform chatters to AttendanceDBData[]
    const attendanceDBData: AttendanceDBData[] = [];
    chatters.forEach((chatter) => {
      // if already exist, skip
      if (alreadyPresentData.length) {
        const isExist = alreadyPresentData.find(
          (item) => item.login === chatter.login
        );
        if (isExist) return;
      }

      AlreadyPresent.set(streamId, [...alreadyPresentData, chatter]);
      alreadyPresentData = AlreadyPresent.get(streamId)!;

      attendanceDBData.push({
        stream_id: streamId,
        login: chatter.login,
        display_name: chatter.displayName,
        followers: chatter.followers,
        profile_image_url: chatter.profileImageUrl || "",
        present_at: chatter.presentAt,
      });
    });

    if (attendanceDBData.length === 0) {
      return res.status(200).json({ status: true });
    }

    const queue = NewAttendanceQueue(streamId);
    if (!queue) {
      return res.status(500).json({ status: false });
    }
    queue.createJob(attendanceDBData).retries(1).save();

    if (BroadcastAttendance.has(streamId)) {
      BroadcastAttendance.delete(streamId);
    }

    return res.status(200).json({
      status: true,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ status: false });
  }
}

setInterval(
  () => {
    console.log(`Clearing AlreadyPresent of ${AlreadyPresent.size} entries`);
    AlreadyPresent.clear();
  },
  1000 * 60 * 60 * 12
); // every 12 hours
