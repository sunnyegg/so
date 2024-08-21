export default function ModalBlacklistWords({
  onSaveBlacklist,
  onChangeBlacklist,
  onCloseBlacklist,
  stateBlacklistWords,
}: {
  onSaveBlacklist: any;
  onChangeBlacklist: any;
  onCloseBlacklist: any;
  stateBlacklistWords: any;
}) {
  return (
    <dialog id="blacklist_words_modal" className="modal">
      <div className="modal-box">
        <h3 className="text-xs md:text-lg font-bold">Blacklist Words</h3>
        <p className="py-4 text-xs md:text-base">
          Blacklist some words so they do not show up (ex: cheap viewers,buy followers)
        </p>
        <form action="">
          <div className="space-y-2">
            <div className="mt-2">
              <div className="flex rounded-md">
                <input
                  type="text"
                  className="input input-bordered w-full text-xs md:text-base"
                  placeholder="ex: cheap viewers,buy followers"
                  value={stateBlacklistWords}
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
              onClick={() => onSaveBlacklist(stateBlacklistWords)}
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
