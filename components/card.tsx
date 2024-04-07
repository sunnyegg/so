import { useEffect, useState } from "react";
import Image from "next/legacy/image";
import { TIMER_CARD } from "@/const/keys";

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
  const [timerCard, setTimerCard] = useState<string>('0');

  const chatterCard = document.getElementById(`chatter_${idx}`);

  useEffect(() => {
    const currentTimer = localStorage.getItem(TIMER_CARD) || "60";
    setTimerCard(currentTimer)

    if (currentTimer !== "0") {
      const interval = setInterval(() => {
        // 70 = 18 detik
        // 60 = 15 detik
        // 50 = 12 detik
        // 40 = 9 detik
        // 30 = 6 detik
        // 20 = 3 detik
        setCountdown(countdown - 0.5);
      }, Number(currentTimer));

      if (countdown <= 0) {
        clearInterval(interval);

        if (chatterCard) {
          chatterCard.classList.add("animate__fadeOut");

          setTimeout(() => {
            setShownChatter(chat.id, true);
          }, 1000);
        }
      }

      return () => clearInterval(interval);
    }
  }, [countdown]);

  const closeCard = () => {
    if (chatterCard) {
      chatterCard.classList.add("animate__fadeOut");

      setTimeout(() => {
        setShownChatter(chat.id, true);
      }, 1000);
    }
  }

  return (
    <div
      className="animate__animated animate__fadeInDown flex items-center justify-between rounded-lg bg-slate-100 p-4"
      id={`chatter_${idx}`}
    >
      <div className="flex items-center space-x-2">
        <div className="avatar">
          <div className="h-10 w-10 rounded-lg border-2 border-lime-300 md:h-16 md:w-16 relative">
            {chat?.image === "" ? (
              ""
            ) : (
              <Image
                src={chat.image}
                alt="Profile"
                priority
                className="rounded-lg"
                layout="fill"
              />
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700 md:text-base">
            {chat?.name}
          </p>
          <p className="text-[0.5rem] text-slate-700 md:text-xs">
            {chat?.followers} Followers
          </p>
          <p className="text-[0.5rem] text-slate-700 md:text-xs">
            Last Streamed: <b>{chat?.lastStreamed}</b>
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          className="btn btn-sm md:btn-md border-lime-300 bg-lime-300 text-center text-slate-700 hover:border-lime-200 hover:bg-lime-200"
          onClick={() =>
            shoutout(chat?.username, setLoading, chatterCard, chat?.id)
          }
        >
          {loading ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : (
            <>
              <svg className="md:hidden" width="15" height="15" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="m11 14 7 4V2l-7 4H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v4h2v-4h3zm1-6.268 4-2.286v9.108l-4-2.286V7.732zM10 12H4V8h6v4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <p className="hidden md:block">Shoutout</p>
            </>
          )}
        </button>

        {timerCard === '0' ? <button
          className="btn btn-sm md:btn-md border-red-400 bg-red-400 text-center text-slate-700 hover:border-red-200 hover:bg-red-200"
          onClick={() => closeCard()}
        >
          X
        </button> : ''}
      </div>

      {timerCard === '0' ? '' : <progress
        className="progress progress-success absolute bottom-0 left-0 w-full rounded-none"
        value={countdown}
        max="100"
      ></progress>}
    </div>
  );
}
