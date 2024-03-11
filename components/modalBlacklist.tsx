export default function modalBlacklist({ onSaveBlacklist, chattersBlacklist, onChangeBlacklist, onCloseBlacklist, stateChattersBlacklist }: { onSaveBlacklist: any, chattersBlacklist: any, onChangeBlacklist: any, onCloseBlacklist: any, stateChattersBlacklist: any }) {
  return (
    <dialog id="blacklist_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Blacklist Chatter</h3>
        <p className="py-4">Blacklist your chatter so they do not show up (ex: Nightbot)</p>
        <form action="">
          <div className="space-y-2">
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <input
                  type="text"
                  name="Blacklist-chatter"
                  className="block flex-1 border-0 p-2 text:white bg-transparent"
                  placeholder="split by comma (,)"
                  value={stateChattersBlacklist}
                  onChange={(val) => onChangeBlacklist(val)}
                />
              </div>
            </div>
          </div>
        </form>
        <div className="modal-action">
          <form method="dialog" className="space-x-2">
            <button type="submit" className="btn btn-success" onClick={() => onSaveBlacklist(stateChattersBlacklist)}>Save</button>
            <button className="btn" onClick={() => onCloseBlacklist()}>Close</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}