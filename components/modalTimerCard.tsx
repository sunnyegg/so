import { TIMER_CARD } from "@/const/keys";
import { useEffect, useState } from "react";

export default function ModalTimerCard({
  currentTimer
}: {
  currentTimer: any
}) {
  const [timerValue, setTimerValue] = useState('0')

  useEffect(() => {
    setTimerValue(currentTimer)
  }, [currentTimer])

  const onChangeTimer = (e: any) => {
    setTimerValue(e.target.value)
  }

  const onSaveButton = (value: string) => {
    localStorage.setItem(TIMER_CARD, value)
    location.reload()
  }

  const onCloseButton = () => {
    setTimerValue(localStorage.getItem(TIMER_CARD) || '60')
  }

  return (
    <dialog id="timer_card_modal" className="modal">
      <div className="modal-box">
        <h3 className="text-xs md:text-lg font-bold">Timer Card</h3>
        <p className="py-4 text-xs md:text-base">
          Time for the card to disappear
        </p>

        <div className="form-control">
          <label className="label cursor-pointer justify-normal">
            <input type="radio" name="radio-10" className="radio checked:bg-red-500 mr-2 h-5 w-5" value={0} checked={timerValue === '0'} onChange={onChangeTimer} />
            <span className="label-text text-xs md:text-base">No Timer</span>
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer justify-normal">
            <input type="radio" name="radio-10" className="radio checked:bg-lime-500 mr-2 h-5 w-5" value={30} checked={timerValue === '30'} onChange={onChangeTimer} />
            <span className="label-text text-xs md:text-base">Short (6s)</span>
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer justify-normal">
            <input type="radio" name="radio-10" className="radio checked:bg-lime-500 mr-2 h-5 w-5" value={60} checked={timerValue === '60'} onChange={onChangeTimer} />
            <span className="label-text text-xs md:text-base">Normal (15s)</span>
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer justify-normal">
            <input type="radio" name="radio-10" className="radio checked:bg-lime-500 mr-2 h-5 w-5" value={80} checked={timerValue === '80'} onChange={onChangeTimer} />
            <span className="label-text text-xs md:text-base">Long (21s)</span>
          </label>
        </div>

        <div className="modal-action">
          <form method="dialog" className="space-x-2">
            <button className="btn btn-sm md:btn-md btn-success text-xs md:text-base" onClick={() => onSaveButton(timerValue)}>
              Save
            </button>

            <button className="btn btn-sm md:btn-md text-xs md:text-base" onClick={onCloseButton}>
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
