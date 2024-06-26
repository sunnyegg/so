import { IS_ANNOUNCEMENT_READ } from "@/const/keys";

export default function ModalAnnouncement() {
  localStorage.setItem(IS_ANNOUNCEMENT_READ, "true")

  return (
    <dialog id="announcement_modal" className="modal">
      <div className="modal-box">
        <h3 className="mb-4 text-xs md:text-lg font-bold">Announcement</h3>

        <div className="mb-4 space-y-2 text-xs md:text-base">
          <p>Hey! It's Sunny here!</p>
          <p>Thank you so much for using this app! Sorry for the no-update for a while. There's so many things happening lately.</p>
          <br />
          <p>With this announcement, I update:</p>
          <p className="text-sm">- Redeemer channel point will be shown in "Shoutout" section</p>
          <p className="text-sm">- Redeemer channel point will be saved in "Attendance" section</p>
          <br />
          <p className="text-xs">*please relogin after you close this announcement ^_^</p>
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
