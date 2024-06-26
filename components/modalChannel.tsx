import { Channel } from "@/app/types";
import Image from "next/legacy/image";

export default function ModalChannel({
  mySession,
  onChooseChannel,
  channels,
}: {
  mySession: any;
  onChooseChannel: any;
  channels: any;
}) {
  return (
    <dialog id="channel_modal" className="modal">
      <div className="modal-box">
        <h3 className="mb-4 text-xs md:text-lg font-bold">Switch Channel</h3>

        <div className="mb-4 space-y-2 text-xs md:text-base">
          <h4>You:</h4>

          <form method="dialog" className="flex flex-wrap justify-between">
            <button
              className="mb-2 space-x-2 rounded-md border-2 border-slate-500 hover:bg-slate-600"
              onClick={() =>
                onChooseChannel({
                  broadcaster_id: mySession.id,
                  broadcaster_name: mySession.name,
                  broadcaster_image: mySession.image,
                  broadcaster_login: mySession.name,
                })
              }
            >
              <div className="flex items-center space-x-2 p-2">
                <div className="avatar">
                  <div className="h-5 w-5 md:h-10 md:w-10 relative">
                    {mySession.image === "" ? (
                      ""
                    ) : (
                      <Image
                        src={mySession.image}
                        alt="My Channel Profile"
                        priority
                        layout="fill"
                        className="rounded-md"
                      />
                    )}
                  </div>
                </div>
                <div>{mySession.name}</div>
              </div>
            </button>
          </form>
        </div>

        {channels.length ? <div className="mb-4 space-y-2 text-xs md:text-lg">
          <h4>Channels You Moderate:</h4>

          <form method="dialog" className="flex flex-wrap gap-2">
            {channels.map((c: Channel, idx: number) => {
              return (
                <div key={idx}>
                  <button
                    className="mb-2 rounded-md border-2 border-slate-500 hover:bg-slate-600"
                    onClick={() => onChooseChannel(c)}
                  >
                    <div className="flex items-center space-x-2 p-2">
                      <div className="avatar">
                        <div className="h-5 w-5 md:h-10 md:w-10 relative">
                          {c.broadcaster_image === "" ? (
                            ""
                          ) : (
                            <Image
                              src={c.broadcaster_image || ""}
                              alt="Channel Profile"
                              priority
                              layout="fill"
                              className="rounded-md"
                            />
                          )}
                        </div>
                      </div>
                      <div>{c.broadcaster_name}</div>
                    </div>
                  </button>
                </div>
              );
            })}
          </form>
        </div> : ''}

        <div>
          <p className="text-sm">*ps: if someone is not here, try relogin</p>
        </div>

        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-sm md:btn-md text-xs md:text-base">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
