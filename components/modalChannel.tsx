import { Channel } from "@/app/types";
import Image from "next/image";

export default function modalChannel({
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
        <h3 className="mb-4 text-lg font-bold">Switch Channel</h3>

        <div className="mb-4 space-y-2">
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
                  <div className="h-10 w-10 rounded-md">
                    {mySession.image === "" ? (
                      ""
                    ) : (
                      <Image
                        src={mySession.image}
                        width={100}
                        height={100}
                        alt="My Channel Profile"
                        priority
                      />
                    )}
                  </div>
                </div>
                <div>{mySession.name}</div>
              </div>
            </button>
          </form>
        </div>

        <div className="mb-4 space-y-2">
          <h4>Channels You Moderate:</h4>

          <form method="dialog" className="flex flex-wrap justify-between">
            {channels.length
              ? channels.map((c: Channel, idx: number) => {
                  return (
                    <div key={idx}>
                      <button
                        className="mb-2 rounded-md border-2 border-slate-500 hover:bg-slate-600"
                        onClick={() => onChooseChannel(c)}
                      >
                        <div className="flex items-center space-x-2 p-2">
                          <div className="avatar">
                            <div className="h-10 w-10 rounded-md">
                              {c.broadcaster_image === "" ? (
                                ""
                              ) : (
                                <Image
                                  src={c.broadcaster_image || ""}
                                  width={100}
                                  height={100}
                                  alt="Channel Profile"
                                  priority
                                />
                              )}
                            </div>
                          </div>
                          <div>{c.broadcaster_name}</div>
                        </div>
                      </button>
                    </div>
                  );
                })
              : ""}
          </form>
        </div>

        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
