import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/use-toast";
import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { PersistAuth } from "@/types/persist";

type Stream = {
  title: string;
  gameName: string;
  startDate: string;
  isLive: boolean;
};

export default function StreamCard() {
  const { toast } = useToast();

  const [stream, setStream] = useState<Stream>({} as Stream);

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];

  useEffect(() => {
    if (!auth.accessToken) {
      return;
    }

    getCurrentBroadcast(auth.user.login, auth.accessToken).then((res) => {
      if (res.status) {
        const data = res.data as Stream;
        setStream({ ...data, isLive: true });
        return;
      }

      if (res.code === 404) {
        getChannelInfo(auth.user.login, auth.accessToken).then((res) => {
          if (res.status) {
            const data = res.data as Stream;
            setStream({ ...data, isLive: false });
            return;
          }
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to get stream info",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
    });
  }, [auth]);

  return (
    <div className="flex flex-col rounded-md bg-so-secondary-color p-4">
      <div className="text-lg md:text-[1.5rem]">
        {stream.isLive ? "Ongoing " : "Last "} Stream Info
      </div>
      <div className="flex gap-2 text-[0.8rem] text-so-secondary-text-color md:text-sm">
        <span>Title:</span>
        <span className="text-so-primary-text-color">{stream.title}</span>
      </div>
      <div className="flex gap-2 text-[0.8rem] text-so-secondary-text-color md:text-sm">
        <span>Game:</span>
        <span className="text-so-primary-text-color">{stream.gameName}</span>
      </div>

      {stream.startDate && (
        <div className="flex gap-2 text-[0.8rem] text-so-secondary-text-color md:text-sm">
          <span>Started At:</span>
          <span className="text-so-primary-text-color">
            {dayjs(stream.startDate).format("YYYY-MM-DD, HH:mm:ss")}
          </span>
        </div>
      )}
    </div>
  );
}

const getCurrentBroadcast = async (login: string, token: string) => {
  const res = await fetch(
    `/api/broadcast/current?login=${login}&token=${token}`
  );
  if (!res.ok) {
    return {
      code: res.status,
      status: false,
    };
  }

  const data = await res.json();
  return data;
};

const getChannelInfo = async (login: string, token: string) => {
  const res = await fetch(`/api/channel/info?login=${login}&token=${token}`);
  if (!res.ok) {
    return {
      code: res.status,
      status: false,
    };
  }

  const data = await res.json();
  return data;
};
