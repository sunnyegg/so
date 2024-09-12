import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import { toast } from "../../../components/ui/use-toast";

export default function StreamCard() {
  const router = useRouter();

  const [retries, setRetries] = useState(0);
  const [stream, setStream] = useState<any>({});

  return (
    <div className="flex flex-col rounded-md bg-so-secondary-color p-4">
      <div className="text-lg md:text-[1.5rem]">
        {true ? "Ongoing " : "Current "} Stream Info
      </div>
      <div className="flex gap-2 text-[0.8rem] text-so-secondary-text-color md:text-sm">
        <span>Title:</span>
        <span className="text-so-primary-text-color">{stream.title}</span>
      </div>
      <div className="flex gap-2 text-[0.8rem] text-so-secondary-text-color md:text-sm">
        <span>Game:</span>
        <span className="text-so-primary-text-color">{stream.game_name}</span>
      </div>

      {stream.started_at && (
        <div className="flex gap-2 text-[0.8rem] text-so-secondary-text-color md:text-sm">
          <span>Started At:</span>
          <span className="text-so-primary-text-color">
            {dayjs(stream.started_at).format("YYYY-MM-DD, HH:mm:ss")}
          </span>
        </div>
      )}
    </div>
  );
}
