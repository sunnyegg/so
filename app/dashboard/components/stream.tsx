import dayjs from "dayjs";
import { memo, useEffect } from "react";

import { useToast } from "@/components/ui/use-toast";
import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { Broadcast } from "@/types/broadcast";
import { PersistAuth, PersistStream } from "@/types/persist";

type StreamCardProps = {
  channel: string;
};

function StreamCard(props: StreamCardProps) {
  const { channel } = props;
  const { toast } = useToast();

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];
  const [stream, setStream] = usePersistState(
    PersistStream.name,
    PersistStream.defaultValue
  ) as [Broadcast, React.Dispatch<React.SetStateAction<Broadcast>>];

  const env = process.env.NEXT_PUBLIC_ENVIRONMENT as string;

  useEffect(() => {
    if (!auth.accessToken) {
      return;
    }

    if (env === "dev") {
      getChannelInfo(channel, auth.accessToken).then((res) => {
        if (res.status) {
          const data = res.data as Broadcast;
          setStream({ ...data, isLive: false, streamId: "" });
          return;
        }
      });
      return;
    }

    getOrCreateBroadcast(channel, auth.accessToken).then((res) => {
      if (res.status) {
        const data = res.data as Broadcast;
        setStream(data);
        return;
      }

      if (res.code === 404) {
        getChannelInfo(channel, auth.accessToken).then((res) => {
          if (res.status) {
            const data = res.data as Broadcast;
            setStream({ ...data, isLive: false, streamId: "" });
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
    <div className="mt-8 flex flex-col rounded-md bg-so-secondary-color p-4">
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

const getOrCreateBroadcast = async (login: string, token: string) => {
  const res = await fetch(`/api/broadcast/get-or-create?login=${login}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
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
  const res = await fetch(`/api/channel/info?login=${login}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    return {
      code: res.status,
      status: false,
    };
  }

  const data = await res.json();
  return data;
};

export default memo(StreamCard);
