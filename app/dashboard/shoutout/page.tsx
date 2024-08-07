'use client';

import ShoutoutCard from "@/components/dashboard/shoutout/card";
import { ChatterContext, IChatterContext } from "@/context/chatter";
import { useContext } from "react";

export default function ShoutoutPage() {
  const { chatters } = useContext(ChatterContext) as IChatterContext;

  return (
    <div className="mt-8">
      <div className="bg-so-secondary-color rounded-md p-4 flex flex-col">
        <div className="text-lg md:text-[1.5rem]">Ongoing Stream</div>
        <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
          <span>Title:</span>
          <span className="text-so-primary-text-color">ngodinggg</span>
        </div>
        <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
          <span>Game:</span>
          <span className="text-so-primary-text-color">Software and Game Development</span>
        </div>
        <div className="flex gap-2 text-[0.8rem] md:text-sm text-so-secondary-text-color">
          <span>Started At:</span>
          <span className="text-so-primary-text-color">2023-01-01, 14:00:00</span>
        </div>
      </div>

      <div className="border-t-[1px] mt-8 border-so-secondary-color"></div>

      {chatters.map((item, index) => (
        <ShoutoutCard
          key={index}
          id={`shoutout_card_${index}`}
          avatar={item.user_profile_image_url}
          userName={item.user_name}
          userLogin={item.user_login}
          followers={item.followers}
          lastSeenPlaying={item.last_seen_playing}
          shown={item.shown}
        />
      ))}
    </div>
  )
}