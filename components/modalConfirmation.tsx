export default function ModalConfirmation({
  id,
  content,
  action,
}: {
  id: string,
  content: string,
  action: any
}) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box w-[60%]">
        <h3 className="mb-4 text-sm md:text-lg font-bold">Are you sure?</h3>

        <div className="text-xs md:text-base">You are about to <b>{content}</b></div>

        <div className="modal-action">
          <form method="dialog" className="space-x-2">
            <button className="btn hover:btn-error btn-sm md:btn-md text-xs md:text-base" onClick={() => action()}>
              Yes
            </button>
            <button className="btn btn-sm md:btn-md text-xs md:text-base">
              No
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
