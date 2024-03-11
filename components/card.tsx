import { useEffect, useState } from "react";
import Image from "next/image";

export default function Card({ chat, idx, shoutout, setShownChatter }: { chat: any, idx: any, shoutout: any, setShownChatter: any }) {
  const [countdown, setCountdown] = useState<number>(100);
  const chatterCard = document.getElementById(`chatter_${idx}`)

  useEffect(() => {
    const interval = setInterval(() => {
      // 70 = 18 detik
      // 60 = 15 detik
      // 50 = 12 detik
      // 40 = 9 detik
      // 30 = 6 detik
      // 20 = 3 detik
      setCountdown(countdown - 0.5)
    }, 60);

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
          <div className="rounded-lg border-2 border-lime-300 w-10 h-10 md:w-20 md:h-20">
            {chat?.image === '' ? '' :
              <Image
                src={chat.image}
                width={100}
                height={100}
                alt="Profile"
                priority
              />
            }
          </div>
        </div>
        <div>
          <p className="text-slate-700 font-bold text-xs md:text-lg">{chat?.name}</p>
          <p className="text-slate-700 text-[0.5rem] md:text-xs mb-2">{chat?.followers} Followers</p>
          <p className="text-slate-700 text-[0.5rem] md:text-xs">Last Streamed: <b>{chat?.lastStreamed}</b></p>
        </div>
      </div>

      <button className="btn text-center hover:bg-lime-200 hover:border-lime-200 bg-lime-300 border-lime-300 text-slate-700"
        id={`shoutout_btn_${idx}`}
        onClick={() => shoutout(chat?.name, idx)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20"><path fill-rule="evenodd" d="m11 14 7 4V2l-7 4H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v4h2v-4h3zm1-6.268 4-2.286v9.108l-4-2.286V7.732zM10 12H4V8h6v4z" clip-rule="evenodd"></path></svg>
      </button>

      <progress className="progress progress-success w-full absolute left-0 bottom-0 rounded-none" value={countdown} max="100"></progress>
    </div>
  )
}