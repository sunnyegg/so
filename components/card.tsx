import { useEffect, useState } from "react";
import Image from "next/image";

export default function Card({ chat, idx, shoutout, setShownChatter }: { chat: any, idx: any, shoutout: any, setShownChatter: any }) {
  const [countdown, setCountdown] = useState<number>(100);
  const chatterCard = document.getElementById(`chatter_${idx}`)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(countdown - 0.5)
    }, 20);

    if (countdown <= 0) {
      clearInterval(interval);

      if (chatterCard) {
        chatterCard.classList.remove('animate__fadeInDown')
        chatterCard.classList.add('animate__fadeOut')

        setTimeout(() => {
          setShownChatter(chat.id, true)
        }, 1000);
      }
    }

    return () => clearInterval(interval);
  }, [countdown]);



  return (
    <div className="rounded-lg p-4 bg-slate-100 animate__animated animate__fadeInDown flex justify-between items-center"
      id={`chatter_${idx}`}>
      <div className="flex items-center space-x-3">
        <div className="avatar">
          <div className="rounded-lg border-2 border-lime-300 w-20 h-20">
            <Image
              src={chat?.image || ""}
              width={100}
              height={100}
              alt="Profile"
              priority
            />
          </div>
        </div>
        <div>
          <p className="text-slate-700 font-bold">{chat?.name}</p>
          <p className="text-slate-700 text-xs mb-2">{chat?.followers} Followers</p>
          <p className="text-slate-700 text-xs">Last Streamed: <b>{chat?.lastStreamed}</b></p>
        </div>
      </div>

      <button className="btn text-center hover:bg-lime-200 hover:border-lime-200 bg-lime-300 border-lime-300 text-slate-700"
        id={`shoutout_btn_${idx}`}
        onClick={() => shoutout(chat?.id, chat?.name, idx)}
      >
        Shoutout
      </button>

      <progress className="progress progress-success w-full absolute left-0 bottom-0 rounded-none" value={countdown} max="100"></progress>
    </div>
  )
}