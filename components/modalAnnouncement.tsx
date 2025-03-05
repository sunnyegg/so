import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ModalAnnouncement() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      router.push("https://so.adila.dev");
    }
  }, [countdown, router]);

  return (
    <dialog id="announcement_modal" className="modal">
      <div className="modal-box space-y-4">
        <form method="dialog">
          <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
            ✕
          </button>
        </form>

        <h3 className="mb-4 text-xs font-bold md:text-lg">Announcement</h3>

        <div className="rounded bg-red-600 p-4">
          <div className="mb-4 space-y-2 text-xs text-white">
            <h1>IMPORTANT NOTICE</h1>

            <hr className="my-8 h-px border-0 bg-white" />

            <p className="text-sm">
              Starting from March 8th, 2025, this domain will not be available.
              Please use the new domain:
              <a href="https://so.adila.dev" className="text-blue-500">
                https://so.adila.dev
              </a>
              You will be redirected to the new domain in {countdown} seconds.
            </p>
          </div>
        </div>

        <div className="rounded bg-base-300 p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.8.1</h1>

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <p className="text-sm">
              - fix a bug where the app will not logout when your token is
              expired
            </p>
          </div>
        </div>

        <div className="rounded bg-base-300 p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.8.0</h1>

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <p className="text-sm">
              - add blacklist words: input words that you want to blacklist (ex:
              cheap viewers,buy followers)
            </p>
            <p className="text-sm">
              - user that send message with blacklist words will not be shown in
              the <b>Shoutout</b> and <b>Attendance</b> section afterwards.
            </p>
            <p className="text-sm">
              - I suggest blacklist words like: views,viewers,followers,buy
            </p>
          </div>
        </div>

        <div className="rounded bg-base-300 p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.7.1</h1>

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <p className="text-sm">
              - fix a bug where a chatter showing up multiple times when they
              are sending a message too quickly
            </p>
          </div>
        </div>

        <div className="rounded bg-base-300 p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.7.0</h1>

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <p className="text-sm">
              - now you can download current attendance data (csv) in{" "}
              <b>Attendance</b> section
            </p>
            <p className="text-sm">- fix analytics data</p>
            <p className="text-sm">
              - added some links to contact me (can request feature or report
              error)
            </p>
          </div>
        </div>

        <div className="rounded bg-base-300 p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.6.1</h1>

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <p className="text-sm">
              - fix blacklist username with space not working
            </p>
            <p className="text-sm">
              - fix (hopefully) attendance sometimes disappearing
            </p>
          </div>
        </div>

        <div className="rounded bg-base-300 p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.6.0</h1>

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <p className="text-sm">
              - now you can disable the <b>Shoutout</b> section in Timer Card
              menu (if you want to just use the <b>Attendance</b> section)
            </p>
            <p className="text-sm">
              - now you can shoutout automatically in Auto SO menu and you can
              set the delay (so people will not sus you from using bot)
            </p>
          </div>
        </div>

        <div className="rounded bg-base-300 p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.5.1</h1>

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <p className="text-sm">
              - redeemer channel point will only show up on your own channel
            </p>
            <p className="text-sm">- add button announcement</p>
          </div>
        </div>

        <div className="rounded bg-base-300 p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.5.0</h1>

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <p>Hey! It is Sunny here!</p>
            <p>
              Thank you so much for using this app! Sorry for the no-update for
              a while. There is so many things happening lately.
            </p>
            <br />
            <p>With this announcement, I update:</p>
            <p className="text-sm">
              - Redeemer channel point will be shown in <b>Shoutout</b> section
            </p>
            <p className="text-sm">
              - Redeemer channel point will be saved in <b>Attendance</b>{" "}
              section
            </p>
            <br />
            <p className="text-xs">
              *if you have not, please relogin after you close this announcement
              ^_^
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
