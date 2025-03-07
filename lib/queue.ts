import Queue from "bee-queue";
import supabase from "@/db/supabase";
import { AttendanceQueues } from "@/db/in-memory";
import { logger } from "./logger";
import { nanoid } from "nanoid";
export const NewAttendanceQueue = async (id: string) => {
  const requestId = nanoid();
  try {
    const redisUrl = process.env.NEXT_REDIS_URL;
    if (!redisUrl) {
      throw new Error("Redis URL is not set");
    }

    const cachedQueue = await AttendanceQueues.get(id);
    if (cachedQueue) {
      return cachedQueue;
    }

    const queue = new Queue("attendance-" + id, {
      redis: {
        url: redisUrl
      },
      isWorker: true
    });

    queue.on("error", (err) => {
      logger.error("Attendance queue error", err, {
        requestId,
        method: "POST",
        path: "/api/broadcast/save-attendance",
        params: { id }
      });
    });

    queue.on("ready", () => {
      logger.info("Attendance queue is ready", {
        requestId,
        method: "POST",
        path: "/api/broadcast/save-attendance",
        params: { id }
      });
    });

    queue.process(
      1,
      async (job: Queue.Job<any>, done: Queue.DoneCallback<any>) => {
        logger.info("Processing job", {
          requestId,
          method: "POST",
          path: "/api/broadcast/save-attendance",
          params: { id, jobId: job.id, jobData: job.data }
        });

        const dbRes = await supabase().from("attendance").insert(job.data);

        if (dbRes.status !== 201) {
          logger.error(
            "Failed to save attendance",
            new Error(JSON.stringify(dbRes)),
            {
              requestId,
              method: "POST",
              path: "/api/broadcast/save-attendance",
              params: { id, jobId: job.id, jobData: job.data }
            }
          );
          return done(new Error("Failed to save attendance"), false);
        }

        return done(null, true);
      }
    );

    await AttendanceQueues.set(id, queue);

    return queue;
  } catch (error) {
    logger.error(
      "Failed to create attendance queue",
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      {
        requestId,
        method: "POST",
        path: "/api/broadcast/save-attendance",
        params: { id }
      }
    );
    return null;
  }
};

setInterval(
  async () => {
    console.log(
      `Clearing NewAttendanceQueue of ${await AttendanceQueues.size()} entries`
    );
    Object.keys(AttendanceQueues).forEach(async (key) => {
      const queue = await AttendanceQueues.get(key);
      if (queue?.isRunning()) {
        await queue.close();
      }
      await AttendanceQueues.delete(key);
    });
  },
  1000 * 60 * 60 * 12
); // every 12 hours
