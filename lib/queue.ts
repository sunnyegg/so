import Queue from "bee-queue";
import supabase from "@/db/supabase";

const attendanceQueues = new Map<string, Queue>();

export const NewAttendanceQueue = (id: string) => {
  const redisUrl = process.env.NEXT_REDIS_URL;
  if (!redisUrl) {
    throw new Error("Redis URL is not set");
  }

  if (attendanceQueues.has(id)) {
    return attendanceQueues.get(id)!;
  }

  const queue = new Queue("attendance-" + id, {
    redis: redisUrl,
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

  attendanceQueues.set(id, queue);

  return queue;
};

setInterval(
  () => {
    console.log(`Clearing ${NewAttendanceQueue.length} queues`);
    Object.keys(attendanceQueues).forEach(async (key) => {
      const queue = attendanceQueues.get(key);
      if (queue?.isRunning()) {
        await queue.close();
      }
      attendanceQueues.delete(key);
    });
  },
  1000 * 60 * 60 * 12
); // every 12 hours
