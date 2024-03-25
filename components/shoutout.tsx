import { Chatters } from "@/app/types";
import Card from "./card";

export default function Shoutout({
  chatters,
  shoutout,
  setShownChatter,
  token
}: {
  chatters: Chatters[];
  shoutout: any;
  setShownChatter: any;
  token: any;
}) {
  return (
    <section className="collapse collapse-arrow mb-4 rounded-lg bg-base-200 px-2">
      <input type="checkbox" />
      <div className="collapse-title text-sm md:text-lg px-2">
        Shoutout
      </div>
      <div className="collapse-content px-2 space-y-2 overflow-auto">
        {chatters.length ? (
          <>
            {chatters.map((chat, idx) => {
              return !chat.shown ? (
                <Card
                  chat={chat}
                  idx={idx}
                  shoutout={shoutout}
                  key={idx}
                  setShownChatter={setShownChatter}
                />
              ) : (
                ""
              );
            })}
          </>
        ) : (
          <>
            {token ? (
              <div className="animate__animated animate__fadeIn flex items-center justify-center space-x-2 pt-2 text-sm md:text-base">
                <p>Waiting for someone to chat</p>
                <span className="loading loading-dots loading-sm"></span>
              </div>
            ) : (
              ""
            )}
          </>
        )}
      </div>
    </section>
  )
}
