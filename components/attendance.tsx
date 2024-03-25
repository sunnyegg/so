import { ChattersPresent } from "@/app/types";
import dayjs from "dayjs";
import Image from "next/image";

export default function Attendance({
  chattersPresent,
}: {
  chattersPresent: ChattersPresent;
}) {
  return (
    <section className="collapse collapse-arrow rounded-lg bg-base-200 px-2">
      <input type="checkbox" />
      <div className="collapse-title text-sm md:text-lg px-2">
        Attendance
      </div>

      <div className="collapse-content space-y-2 overflow-auto">
        {Object.entries(chattersPresent).length ? Object.entries(chattersPresent).map((chatter, idx) => {
          return (
            <div key={idx} className="flex items-center justify-between rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="avatar">
                  <div className="h-6 w-6 md:h-10 md:w-10">
                    {chatter[1].image === "" ? (
                      ""
                    ) : (
                      <Image
                        src={chatter[1].image}
                        alt="Profile"
                        priority
                        layout="fill"
                        className="rounded-full"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-xs md:text-base">
                    {chatter[1].name}
                  </p>
                  <p className="text-[0.65rem] md:text-sm">Present at {dayjs(chatter[1].time).format('HH:mm:ss')} ({dayjs(chatter[1].time).format('DD-MM-YYYY')})</p>
                </div>
              </div>
            </div>
          )
        }) : <div className="animate__animated animate__fadeIn flex items-center justify-center p-2">
          <p>No one is here yet :(</p>
        </div>}
      </div >
    </section >
  )
}
