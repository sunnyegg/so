import dayjs from "dayjs";
import { useContext } from "react";

import { IStreamContext, StreamContext } from "@/context/stream";

export default function StreamCard() {
  const { stream } = useContext(StreamContext) as IStreamContext;

  return (
    <div className="bg-so-secondary-color rounded-md p-4 flex flex-col">
      <div className="text-lg md:text-[1.5rem]">{stream.is_live ? "Ongoing " : "Last "} Stream</div>
      <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
        <span>Title:</span>
        <span className="text-so-primary-text-color">{stream.title}</span>
      </div>
      <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
        <span>Game:</span>
        <span className="text-so-primary-text-color">{stream.game_name}</span>
      </div>

      {stream.started_at && (
        <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
          <span>Started At:</span>
          <span className="text-so-primary-text-color">{dayjs(stream.started_at).format("YYYY-MM-DD, HH:mm:ss")}</span>
        </div>
      )}
    </div>
  )
}