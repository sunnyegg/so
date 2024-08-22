import { useContext } from "react";

import { IShoutoutContext, ShoutoutContext } from "@/context/shoutout";

import ShoutoutCard from "./card";

export default function ShoutoutManager() {
  const { shoutouts, removeShoutout } = useContext(ShoutoutContext) as IShoutoutContext;

  return (
    <div>
      {shoutouts.map((item) => (
        <ShoutoutCard
          key={item.id}
          {...item}
          removeShoutout={removeShoutout}
        />
      ))}

      {shoutouts.length === 0 && <div className="mt-8 text-center animate-fade-in">Waiting for someone to chat...</div>}
    </div>
  )
}