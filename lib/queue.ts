import Queue from "bee-queue";
import supabase from "@/db/supabase";
import { AttendanceQueues } from "@/db/in-memory";

export const NewAttendanceQueue = (id: string) => {
  const redisUrl = process.env.NEXT_REDIS_URL;
  if (!redisUrl) {
    throw new Error("Redis URL is not set");
  }

  if (AttendanceQueues.has(id)) {
    return AttendanceQueues.get(id)!;
  }

  const queue = new Queue("attendance-" + id, {
    redis: {
      url: redisUrl,
    },
    isWorker: true,
  });

  queue.on("error", (err) => {
    console.log(`Error: ${err.message}`);
  });

  queue.on("ready", () => {
    console.log(`attendance-${id} is ready`);
  });

  queue.process(
    1,
    async (job: Queue.Job<any>, done: Queue.DoneCallback<any>) => {
      console.log("Processing job: ", job.id, job.data);

      const dbRes = await supabase().from("attendance").insert(job.data);

      if (dbRes.status !== 201) {
        console.log(dbRes);
        return done(new Error("Failed to save attendance"), false);
      }

      return done(null, true);
    }
  );

  AttendanceQueues.set(id, queue);

  return queue;
};

setInterval(
  () => {
    console.log(
      `Clearing NewAttendanceQueue of ${NewAttendanceQueue.length} entries`
    );
    Object.keys(AttendanceQueues).forEach(async (key) => {
      const queue = AttendanceQueues.get(key);
      if (queue?.isRunning()) {
        await queue.close();
      }
      AttendanceQueues.delete(key);
    });
  },
  1000 * 60 * 60 * 12
); // every 12 hours
