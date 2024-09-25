import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { PersistAuth, PersistChannel } from "@/types/persist";

export type ShoutoutCardProps = {
  id: string;
  profileImageUrl: string | undefined;
  login: string;
  displayName: string;
  followers: number;
  lastSeenPlaying: string;
  removeFromShoutout: (id: string) => void;
};

export default function ShoutoutCard(props: ShoutoutCardProps) {
  const [loadingValue, setLoadingValue] = useState<number>(100);
  const [isSoLoading, setIsSoLoading] = useState(false);
  const [isShoutoutLoading, setIsShoutoutLoading] = useState(false);

  const interval = useRef<NodeJS.Timeout>();

  const {
    id,
    profileImageUrl,
    login,
    displayName,
    followers,
    lastSeenPlaying,
    removeFromShoutout,
  } = props;

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];
  const [channel] = usePersistState(
    PersistChannel.name,
    PersistChannel.defaultValue
  ) as [string];

  const handleMessageSO = async (token: string, login: string, ch: string) => {
    setIsSoLoading(true);
    if (ch === login) {
      toast({
        title: "Shoutout Error",
        description: "You cannot shoutout the broadcaster",
        variant: "destructive",
        duration: 2000,
      });
      setIsSoLoading(false);
      return;
    }

    const message = `!so @${login}`;

    const res = await fetch(`/api/chat/send-message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel: ch, message }),
    });
    if (!res.ok) {
      toast({
        title: "Failed to send shoutout",
        variant: "destructive",
        duration: 5000,
      });
      setIsSoLoading(false);
      return;
    }

    toast({
      title: "Shoutout sent",
      variant: "success",
      duration: 2000,
    });

    handleRemoveFromShoutout(id, removeFromShoutout);
    setIsSoLoading(false);
  };

  const handleSendSO = async (token: string, ch: string, login: string) => {
    setIsShoutoutLoading(true);
    const moderator = ch; // TODO: get moderator from context

    if (ch === login) {
      toast({
        title: "Shoutout Error",
        description: "You cannot shoutout the broadcaster",
        variant: "destructive",
      });
      setIsShoutoutLoading(false);
      return;
    }

    const res = await fetch(`/api/chat/send-shoutout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ from: ch, to: login }),
    });
    if (!res.ok) {
      toast({
        title: "Failed to send shoutout",
        variant: "destructive",
        duration: 2000,
      });
      setIsShoutoutLoading(false);
      return;
    }

    toast({
      title: "Shoutout sent",
      variant: "success",
      duration: 2000,
    });

    handleRemoveFromShoutout(id, removeFromShoutout);
    setIsShoutoutLoading(false);
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

      handleRemoveFromShoutout(id, removeFromShoutout);
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
            <AvatarImage src={profileImageUrl} alt={login} />
            <AvatarFallback>{login.charAt(0)}</AvatarFallback>
          </Avatar>

          <div>
            <div className="flex text-lg text-so-secondary-text-color">
              <span className="text-so-primary-text-color">{displayName}</span>
            </div>
            <div className="flex text-[0.8rem] text-so-secondary-text-color">
              <span>@{login}</span>
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
              handleMessageSO(auth.accessToken, login, channel);
            }}
            isLoading={isSoLoading}
          >
            !so
          </Button>
          <Button
            className="bg-so-accent-color text-so-primary-color hover:bg-so-primary-color hover:text-so-accent-color"
            onClick={() => {
              handleSendSO(auth.accessToken, channel, login);
            }}
            isLoading={isShoutoutLoading}
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

const handleRemoveFromShoutout = (
  id: string,
  removeFromShoutout: (id: string) => void
) => {
  const shoutoutCard = document.getElementById(id);
  if (shoutoutCard && !shoutoutCard.classList.contains("animate-fade-out")) {
    shoutoutCard.classList.remove("animate-fade-in");
    shoutoutCard.classList.add("animate-fade-out");

    setTimeout(() => {
      removeFromShoutout(id);
    }, 500);
  }
};
