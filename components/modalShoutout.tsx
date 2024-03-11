import Image from "next/image";
import { useState } from "react";

export default function ModalShoutout({
  chattersPresent,
  shoutout,
}: {
  chattersPresent: any;
  shoutout: any;
}) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFromAttendance, setLoadingFromAttendance] =
    useState<boolean>(false);

  return (
    <dialog id="shoutout_modal" className="modal">
      <div className="modal-box">
        <h3 className="mb-4 text-lg font-bold">Choose a Channel to Shoutout</h3>

        <div className="mb-4 space-y-2">
          <h4>Type a username:</h4>

          <form className="flex justify-between space-x-2">
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-success"
              onClick={(e) => {
                e.preventDefault();
                shoutout(username, setLoading);
              }}
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
          </form>
        </div>

        <div className="mb-4 space-y-2">
          <h4>Channels from Attendance:</h4>

          <div className="flex flex-wrap justify-between">
            {Object.entries(chattersPresent).length
              ? Object.entries(chattersPresent).map((c: any, idx: number) => {
                  return (
                    <div key={idx}>
                      <button
                        className="mb-2 rounded-md border-2 border-slate-500 hover:bg-slate-600"
                        id={`channel_shoutout_${idx}`}
                        onClick={() =>
                          shoutout(c[1].name, setLoadingFromAttendance)
                        }
                      >
                        <div className="flex items-center space-x-2 p-2">
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
                          <div>
                            {loadingFromAttendance ? (
                              <div className="loading loading-spinner loading-sm"></div>
                            ) : (
                              c[1].name
                            )}
                          </div>
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
            <button className="btn" onClick={() => setUsername("")}>
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
