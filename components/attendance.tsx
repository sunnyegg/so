import { ChattersPresent } from "@/app/types";
import dayjs from "dayjs";
import Image from "next/image";

export default function Attendance({
  chattersPresent,
}: {
  chattersPresent: ChattersPresent;
}) {
  return (
    <section className="collapse collapse-arrow rounded-lg p-2 bg-zinc-800">
      <input type="checkbox" />
      <div className="collapse-title text-[1.5rem] px-2">
        Attendance
      </div>

      <div className="collapse-content space-y-2">
        {Object.entries(chattersPresent).length ? Object.entries(chattersPresent).map((chatter) => {
          return (
            <div className="flex items-center justify-between rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="avatar">
                  <div className="h-10 w-10 rounded-full md:h-15 md:w-15">
                    {chatter[1].image === "" ? (
                      ""
                    ) : (
                      <Image
                        src={chatter[1].image}
                        width={100}
                        height={100}
                        alt="Profile"
                        priority
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-bold">
                    {chatter[1].name}
                  </p>
                  <p className="text-xs md:text-sm">Present at {dayjs(chatter[1].time).format('HH:mm:ss')} ({dayjs(chatter[1].time).format('DD-MM-YYYY')})</p>
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
