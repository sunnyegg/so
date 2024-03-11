import Image from "next/image";

export default function modalShoutout({
  chattersPresent,
  shoutout,
}: {
  chattersPresent: any;
  shoutout: any;
}) {
  return (
    <dialog id="shoutout_modal" className="modal">
      <div className="modal-box">
        <h3 className="mb-4 text-lg font-bold">Choose a Channel</h3>

        <div className="mb-4 space-y-2">
          <h4>Channels from Attendance:</h4>

          <div className="flex flex-wrap justify-between">
            {Object.entries(chattersPresent).length
              ? Object.entries(chattersPresent).map((c: any, idx: number) => {
                  return (
                    <div key={idx}>
                      <button
                        className="mb-2"
                        id={`channel_shoutout_${idx}`}
                        onClick={() =>
                          shoutout(c[1].name, `channel_shoutout_${idx}`)
                        }
                      >
                        <div className="flex items-center space-x-2 rounded-md border-2 border-slate-500 p-2">
                          <div className="avatar">
                            <div className="h-10 w-10 rounded-md">
                              {c.image === "" ? (
                                ""
                              ) : (
                                <Image
                                  src={c[1].image || ""}
                                  width={100}
                                  height={100}
                                  alt="Channel Profile"
                                  priority
                                />
                              )}
                            </div>
                          </div>
                          <div>{c[1].name}</div>
                        </div>
                      </button>
                    </div>
                  );
                })
              : ""}
          </div>
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
