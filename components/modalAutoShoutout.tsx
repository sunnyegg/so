import { AUTO_SO_DELAY, IS_AUTO_SO_ENABLED } from "@/const/keys";
import { useEffect, useState } from "react";

export default function ModalAutoShoutout({
  currentStatus,
  currentDelay,
}: {
  currentStatus: any;
  currentDelay: any;
}) {
  const [isEnable, setIsEnable] = useState(true)
  const [valueDelay, setValueDelay] = useState(0)

  useEffect(() => {
    setIsEnable(currentStatus)
    setValueDelay(currentDelay)
  }, [currentStatus, currentDelay])

  const onChangeAutoSO = (e: any) => {
    setIsEnable(e.target.checked)
  }

  const onChangeDelay = (e: any) => {
    const val = e.target.value
    if (val >= 0) {
      setValueDelay(val)
    }
  }

  const onSaveButton = () => {
    localStorage.setItem(AUTO_SO_DELAY, valueDelay.toString())
    localStorage.setItem(IS_AUTO_SO_ENABLED, isEnable ? 'true' : 'false')
    location.reload()
  }

  const onCloseButton = () => {
    setValueDelay(Number(localStorage.getItem(AUTO_SO_DELAY)) || 0)

    const currentStatus = localStorage.getItem(IS_AUTO_SO_ENABLED)
    if (currentStatus === null) {
      setIsEnable(false)
    } else {
      setIsEnable(currentStatus === 'true' ? true : false)
    }
  }

  return (
    <dialog id="auto_so_modal" className="modal">
      <div className="modal-box">
        <h3 className="mb-4 text-xs md:text-lg font-bold">Auto Shoutout</h3>

        <div className="mb-4 space-y-2 text-xs md:text-base">
          <form className="flex justify-between flex-col">
            <label className="label cursor-pointer justify-normal gap-2">
              <input type="checkbox" className="toggle toggle-success" checked={isEnable} onChange={onChangeAutoSO} />
              <span className="label-text text-xs md:text-base">Enable Auto Shoutout</span>
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Enter Delay (second)</span>
              </div>
              <input type="number" placeholder="Type here" className="input input-bordered w-full max-w-xs" value={valueDelay} onChange={onChangeDelay} disabled={!isEnable} />
            </label>
          </form>
        </div>

        <div className="modal-action">
          <form method="dialog" className="space-x-2">
            <button
              type="submit"
              className="btn btn-sm md:btn-md btn-success text-xs md:text-base"
              onClick={() => onSaveButton()}
            >
              Save
            </button>

            <button className="btn btn-sm md:btn-md text-xs md:text-base" onClick={() => onCloseButton()}>
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
