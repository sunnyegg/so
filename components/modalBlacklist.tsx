export default function ModalBlacklist({
  onSaveBlacklist,
  onChangeBlacklist,
  onCloseBlacklist,
  stateChattersBlacklist,
}: {
  onSaveBlacklist: any;
  onChangeBlacklist: any;
  onCloseBlacklist: any;
  stateChattersBlacklist: any;
}) {
  return (
    <dialog id="blacklist_modal" className="modal">
      <div className="modal-box">
        <h3 className="text-xs md:text-lg font-bold">Blacklist Chatter</h3>
        <p className="py-4 text-xs md:text-base">
          Blacklist your chatter so they do not show up (ex: Nightbot)
        </p>
        <form action="">
          <div className="space-y-2">
            <div className="mt-2">
              <div className="flex rounded-md">
                <input
                  type="text"
                  className="input input-bordered w-full text-xs md:text-base"
                  placeholder="ex: sunnybot,nightbot"
                  value={stateChattersBlacklist}
                  onChange={(val) => onChangeBlacklist(val)}
                />
              </div>
            </div>
          </div>
        </form>
        <div className="modal-action">
          <form method="dialog" className="space-x-2">
            <button
              type="submit"
              className="btn btn-sm md:btn-md btn-success text-xs md:text-base"
              onClick={() => onSaveBlacklist(stateChattersBlacklist)}
            >
              Save
            </button>
            <button className="btn btn-sm md:btn-md text-xs md:text-base" onClick={() => onCloseBlacklist()}>
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
