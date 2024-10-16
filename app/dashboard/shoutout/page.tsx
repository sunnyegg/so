"use client";

import { useContext } from "react";

import { Button } from "@/components/ui/button";
import ShoutoutManager from "@/app/dashboard/shoutout/components/manager";

import { TwitchContext } from "@/contexts/twitch";
import usePersistState from "@/hooks/use-persist-state";

import { Settings } from "@/types/settings";
import { PersistSettings } from "@/types/persist";

export default function ShoutoutPage() {
  const { isConnectedChat } = useContext(TwitchContext).chat;
  const { stream, setLive } = useContext(TwitchContext).stream;

  const [settings] = usePersistState(
    PersistSettings.name,
    PersistSettings.defaultValue
  ) as [Settings];

  const env = process.env.NEXT_PUBLIC_ENVIRONMENT as string;

  return (
    <div className="mt-8">
      <div className="relative min-h-[50vh]">
        {settings.autoSo && (
          <div className="absolute bottom-0 left-0 right-0 top-0 z-[1] mx-auto mt-8 h-fit w-fit rounded-md bg-so-accent-color p-4 font-bold text-so-primary-color shadow-md">
            You are on Auto SO mode
          </div>
        )}

        <div className={"" + (settings.autoSo && "blur")}>
          {!isConnectedChat && stream.isLive && (
            <div className="animate-fade-in mt-8 text-center">
              Connecting to chat...
            </div>
          )}

          <ShoutoutManager />

          {!stream.isLive && (
            <div className="mt-8 text-center">
              <div className="animate-fade-in">
                It seems that you are not live right now...
              </div>

              {/* dev */}
              {env === "dev" && (
                <Button variant={"streamegg"} onClick={() => setLive(true)}>
                  Live
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
