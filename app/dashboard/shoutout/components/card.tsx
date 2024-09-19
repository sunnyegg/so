import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type ShoutoutCardProps = {
  id: string;
  avatar: string | undefined;
  channel: string;
  userName: string;
  userLogin: string;
  followers: number;
  lastSeenPlaying: string;
  removeShoutout: (id: string) => void;
};

export default function ShoutoutCard({
  id,
  avatar,
  userName,
  userLogin,
  followers,
  lastSeenPlaying,
  channel,
  removeShoutout,
}: ShoutoutCardProps) {
  const [loadingValue, setLoadingValue] = useState<number>(100);
  const interval = useRef<NodeJS.Timeout>();

  const handleMessageSO = (
    token: string,
    userLogin: string,
    channel: string
  ) => {
    const message = `!so @${userLogin}`;
    // sendMessage(token, channel, message);
    handleRemoveShoutout(id, removeShoutout);
  };

  const handleSendSO = (token: string, channel: string, userLogin: string) => {
    const moderator = channel; // TODO: get moderator from context

    if (channel === userLogin) {
      toast({
        title: "Shoutout Error",
        description: "You can't shoutout the broadcaster",
        variant: "destructive",
      });
      return;
    }

    // sendShoutout(token, channel, userLogin, moderator);
    handleRemoveShoutout(id, removeShoutout);
  };

  useEffect(() => {
    interval.current = setInterval(() => {
      setLoadingValue((prevValue) => prevValue - 1);
    }, 100);

    return () => {
      clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    if (loadingValue <= 0) {
      clearInterval(interval.current);

      handleRemoveShoutout(id, removeShoutout);
    }
  }, [loadingValue]);

  return (
    <div
      id={id}
      className="animate-fade-in my-8 flex flex-col rounded-md bg-so-secondary-color"
    >
      <div className="flex flex-col justify-between gap-4 p-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar} alt={userLogin} />
            <AvatarFallback>{userLogin.charAt(0)}</AvatarFallback>
          </Avatar>

          <div>
            <div className="flex text-lg text-so-secondary-text-color">
              <span className="text-so-primary-text-color">{userName}</span>
            </div>
            <div className="flex text-[0.8rem] text-so-secondary-text-color">
              <span>@{userLogin}</span>
            </div>
            <div className="flex gap-2 text-[0.8rem] text-so-secondary-text-color">
              <span className="text-so-primary-text-color">{followers}</span>
              <span>followers</span>
            </div>
            <div className="flex gap-2 text-[0.8rem] text-so-secondary-text-color">
              <span>Last seen playing:</span>
              <span className="text-so-primary-text-color">
                {lastSeenPlaying}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="bg-so-accent-color text-so-primary-color hover:bg-so-primary-color hover:text-so-accent-color"
            onClick={() => {
              // handleMessageSO(auth.access_token, userLogin, channel)
            }}
          >
            !so
          </Button>
          <Button
            className="bg-so-accent-color text-so-primary-color hover:bg-so-primary-color hover:text-so-accent-color"
            onClick={() => {
              // handleSendSO(auth.access_token, channel, userLogin)
            }}
          >
            /shoutout
          </Button>
        </div>
      </div>

      <Progress
        className="rounded-none rounded-b-sm border-0"
        value={loadingValue}
      />
    </div>
  );
}

const handleRemoveShoutout = (
  id: string,
  removeShoutout: (id: string) => void
) => {
  const shoutoutCard = document.getElementById(id);
  if (shoutoutCard && !shoutoutCard.classList.contains("animate-fade-out")) {
    shoutoutCard.classList.remove("animate-fade-in");
    shoutoutCard.classList.add("animate-fade-out");

    setTimeout(() => {
      removeShoutout(id);
    }, 500);
  }
};
