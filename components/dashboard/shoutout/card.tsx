import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChatterContext, IChatterContext } from "@/context/chatter";
import { useContext, useEffect, useState } from "react";

export type ShoutoutCardProps = {
  id: string;
  avatar: string | undefined;
  userName: string;
  userLogin: string;
  followers: number;
  lastSeenPlaying: string;
  shown: boolean;
}

export default function ShoutoutCard({ shown, id, avatar, userName, userLogin, followers, lastSeenPlaying }: ShoutoutCardProps) {
  const { chatters, setChatters } = useContext(ChatterContext) as IChatterContext;

  const [loadingValue, setLoadingValue] = useState<number>(100);
  let interval: NodeJS.Timeout

  useEffect(() => {
    interval = setInterval(() => {
      setLoadingValue(prevValue => prevValue - 1);
    }, 100);
  }, []);

  useEffect(() => {
    if (loadingValue <= 0) {
      clearInterval(interval);

      const shoutoutCard = document.getElementById(id);
      if (shoutoutCard && !shoutoutCard.classList.contains("animate-fade-out")) {
        shoutoutCard.classList.remove("animate-fade-in");
        shoutoutCard.classList.add("animate-fade-out");
        setTimeout(() => {
          const currChatters = chatters.map(item => {
            if (item.user_login === userLogin) {
              return {
                ...item,
                shown: true,
              }
            }

            return item;
          });
          setChatters(currChatters);

          shoutoutCard.classList.add("hidden");
        }, 500);
      }
    }
  }, [loadingValue])

  return (
    <>
      {!shown && <div id={id} className="animate-fade-in bg-so-secondary-color rounded-md flex flex-col my-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 p-4">
          <div className="flex gap-4 items-center">
            <Avatar className="w-16 h-16">
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
                <span className="text-so-primary-text-color">{lastSeenPlaying}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="bg-so-accent-color text-so-primary-color hover:bg-so-primary-color hover:text-so-accent-color">!so</Button>
            <Button className="bg-so-accent-color text-so-primary-color hover:bg-so-primary-color hover:text-so-accent-color">/shoutout</Button>
          </div>
        </div>

        <Progress className="rounded-none rounded-b-sm border-0" value={loadingValue} />
      </div>}
    </>
  )
}