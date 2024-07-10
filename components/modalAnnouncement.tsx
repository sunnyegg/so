export default function ModalAnnouncement() {
  return (
    <dialog id="announcement_modal" className="modal">
      <div className="modal-box space-y-4">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>

        <h3 className="mb-4 text-xs md:text-lg font-bold">Announcement</h3>

        <div className="bg-base-300 rounded p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.7.0</h1>

            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

            <p className="text-sm">- now you can download current attendance data (csv) in <b>Attendance</b> section</p>
            <p className="text-sm">- fix analytics data</p>
            <p className="text-sm">- added some links to contact me (can request feature or report error)</p>
          </div>
        </div>

        <div className="bg-base-300 rounded p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.6.1</h1>

            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

            <p className="text-sm">- fix blacklist username with space not working</p>
            <p className="text-sm">- fix (hopefully) attendance sometimes disappearing</p>
          </div>
        </div>

        <div className="bg-base-300 rounded p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.6.0</h1>

            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

            <p className="text-sm">- now you can disable the <b>Shoutout</b> section in Timer Card menu (if you want to just use the <b>Attendance</b> section)</p>
            <p className="text-sm">- now you can shoutout automatically in Auto SO menu and you can set the delay (so people will not sus you from using bot)</p>
          </div>
        </div>

        <div className="bg-base-300 rounded p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.5.1</h1>

            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

            <p className="text-sm">- redeemer channel point will only show up on your own channel</p>
            <p className="text-sm">- add button announcement</p>
          </div>
        </div>

        <div className="bg-base-300 rounded p-4">
          <div className="mb-4 space-y-2 text-xs md:text-base">
            <h1>0.5.0</h1>

            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

            <p>Hey! It is Sunny here!</p>
            <p>Thank you so much for using this app! Sorry for the no-update for a while. There is so many things happening lately.</p>
            <br />
            <p>With this announcement, I update:</p>
            <p className="text-sm">- Redeemer channel point will be shown in <b>Shoutout</b> section</p>
            <p className="text-sm">- Redeemer channel point will be saved in <b>Attendance</b> section</p>
            <br />
            <p className="text-xs">*if you have not, please relogin after you close this announcement ^_^</p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
