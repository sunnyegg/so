import { useEffect, useState } from "react";
import Image from "next/image";

export default function Card({
  chat,
  idx,
  shoutout,
  setShownChatter,
}: {
  chat: any;
  idx: any;
  shoutout: any;
  setShownChatter: any;
}) {
  const [countdown, setCountdown] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);

  const chatterCard = document.getElementById(`chatter_${idx}`);

  useEffect(() => {
    const interval = setInterval(() => {
      // 70 = 18 detik
      // 60 = 15 detik
      // 50 = 12 detik
      // 40 = 9 detik
      // 30 = 6 detik
      // 20 = 3 detik
      setCountdown(countdown - 0.5);
    }, 60);

    if (countdown <= 0) {
      clearInterval(interval);

      if (chatterCard) {
        chatterCard.classList.remove("animate__fadeInDown");
        chatterCard.classList.add("animate__fadeOut");

        setTimeout(() => {
          setShownChatter(chat.id, true);
        }, 1000);
      }
    }

    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div
      className="animate__animated animate__fadeInDown flex items-center justify-between rounded-lg bg-slate-100 p-4"
      id={`chatter_${idx}`}
    >
      <div className="flex items-center space-x-3">
        <div className="avatar">
          <div className="h-10 w-10 rounded-lg border-2 border-lime-300 md:h-20 md:w-20">
            {chat?.image === "" ? (
              ""
            ) : (
              <Image
                src={chat.image}
                width={100}
                height={100}
                alt="Profile"
                priority
              />
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700 md:text-lg">
            {chat?.name}
          </p>
          <p className="mb-2 text-[0.5rem] text-slate-700 md:text-xs">
            {chat?.followers} Followers
          </p>
          <p className="text-[0.5rem] text-slate-700 md:text-xs">
            Last Streamed: <b>{chat?.lastStreamed}</b>
          </p>
        </div>
      </div>

      <button
        className="btn border-lime-300 bg-lime-300 text-center text-slate-700 hover:border-lime-200 hover:bg-lime-200"
        onClick={() => shoutout(chat?.name, setLoading)}
      >
        {loading ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="m11 14 7 4V2l-7 4H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v4h2v-4h3zm1-6.268 4-2.286v9.108l-4-2.286V7.732zM10 12H4V8h6v4z"
              clip-rule="evenodd"
            ></path>
          </svg>
        )}
      </button>

      <progress
        className="progress progress-success absolute bottom-0 left-0 w-full rounded-none"
        value={countdown}
        max="100"
      ></progress>
    </div>
  );
}
