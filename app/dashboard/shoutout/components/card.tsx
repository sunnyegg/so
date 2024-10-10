import { useContext, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import {
  PersistAttendance,
  PersistAuth,
  PersistChannel,
  PersistSettings,
} from "@/types/persist";
import { Settings } from "@/types/settings";

import { TwitchContext } from "@/contexts/twitch";
import { SelectedChannel } from "@/types/channel";

export type ShoutoutCardProps = {
  id: string;
  profileImageUrl: string | undefined;
  login: string;
  displayName: string;
  followers: number;
  lastSeenPlaying: string;
  removeFromShoutout: (id: string) => void;
  sendMessageSO: (token: string, login: string, ch: string) => Promise<string>;
  sendSO: (token: string, login: string, ch: string) => Promise<string>;
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
    sendMessageSO,
    sendSO,
  } = props;

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];
  const [channel] = usePersistState(
    PersistChannel.name,
    PersistChannel.defaultValue
  ) as [SelectedChannel];
  const [_, setAttendance] = usePersistState(
    PersistAttendance.name,
    PersistAttendance.defaultValue
  );
  const [settings] = usePersistState(
    PersistSettings.name,
    PersistSettings.defaultValue
  ) as [Settings];

  const { attendance } = useContext(TwitchContext).chat;

  const handleMessageSO = async (token: string, login: string, ch: string) => {
    setIsSoLoading(true);

    const res = await sendMessageSO(token, login, ch);
    if (res !== "") {
      toast({
        title: "Shoutout Error",
        description: res,
        variant: "destructive",
        duration: 2000,
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

  const handleSendSO = async (token: string, login: string, ch: string) => {
    setIsShoutoutLoading(true);

    const res = await sendSO(token, login, ch);
    if (res !== "") {
      toast({
        title: "Shoutout Error",
        description: res,
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
      setAttendance(attendance);
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

        <TooltipProvider>
          <div className="flex flex-col gap-2">
            {settings.autoSo ? (
              <>
                <Button variant={"streamegg-disabled"}>!so</Button>
                <Button variant={"streamegg-disabled"}>/shoutout</Button>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-so-accent-color text-so-primary-color hover:bg-so-primary-color hover:text-so-accent-color"
                      onClick={() => {
                        handleMessageSO(auth.accessToken, login, channel.login);
                      }}
                      isLoading={isSoLoading}
                    >
                      !so
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send a "!so" message to the chat</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-so-accent-color text-so-primary-color hover:bg-so-primary-color hover:text-so-accent-color"
                      onClick={() => {
                        handleSendSO(auth.accessToken, login, channel.login);
                      }}
                      isLoading={isShoutoutLoading}
                    >
                      /shoutout
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Execute "/shoutout" command in chat</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
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
