import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Image from "next/legacy/image";
import { ChattersPresent } from "@/app/types";
import DownloadIcon from "@/public/download.svg";
import { MY_SESSION } from "@/const/keys";

export default function Attendance({
  chattersPresent,
}: {
  chattersPresent: ChattersPresent;
}) {
  const [dataCSV, setDataCSV] = useState([])
  const [loading, setLoading] = useState(false)
  const [filename, setFilename] = useState("")

  useEffect(() => {
    const session = localStorage.getItem(MY_SESSION) ? JSON.parse(localStorage.getItem(MY_SESSION) || "") : ""
    setFilename(`${session.name}-attendance-`)
  }, [])

  useEffect(() => {
    const data: any = []
    const keys = Object.keys(chattersPresent)
    for (const v of keys) {
      data.push({
        username: chattersPresent[v].username,
        present_at: dayjs(chattersPresent[v].time).format('YYYY-MM-DD HH:mm:ss'),
      })
    }
    setDataCSV(data)
  }, [chattersPresent])

  const exportCSV = async (data: any, filename: any) => {
    setLoading(true)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/export-csv`,
      {
        body: JSON.stringify({
          data,
          filename: filename + dayjs().format('YYYY-MM-DD_HH-mm-ss')
        }),
        method: 'POST'
      }
    );

    const { data: dataFilename } = await res.json()
    const dataCSV = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/${dataFilename}`)
    const blob = await dataCSV.blob()
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', dataFilename);
    document.body.appendChild(link);
    link.click();
    link?.parentNode?.removeChild(link);
    setLoading(false)
  }

  return (
    <section className="collapse collapse-arrow rounded-lg bg-base-200 px-2">
      <input type="checkbox" />
      <div className="collapse-title text-sm md:text-lg px-2">
        Attendance {Object.entries(chattersPresent).length ? `(${Object.entries(chattersPresent).length})` : ''}
      </div>

      <div className="collapse-content space-y-2 overflow-auto">
        {
          Object.entries(chattersPresent).length ? (
            <button className="btn btn-ghost float-end" onClick={() => {
              exportCSV(dataCSV, filename)
            }}>
              {loading ? (
                <div className="loading loading-spinner loading-sm"></div>
              ) : DownloadIcon ? (
                <Image
                  alt="download icon"
                  src={DownloadIcon}
                  width={20}
                  height={20}
                  className="dark:invert"
                />
              ) : (
                ""
              )}
            </button>
          ) : ""
        }


        {Object.entries(chattersPresent).length ? Object.entries(chattersPresent).map((chatter, idx) => {
          return (
            <div key={idx} className="flex items-center justify-between rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="avatar">
                  <div className="h-6 w-6 md:h-10 md:w-10 relative">
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
                    {chatter[1].display_name}
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
