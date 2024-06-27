import Image from "next/legacy/image";
import GearIcon from "@/public/gear.svg";

export default function MenuDropdown() {
  const openShoutoutModal = () => {
    const modal = document.getElementById("shoutout_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const openBlacklistModal = () => {
    const modal = document.getElementById("blacklist_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const openTimerCardModal = () => {
    const modal = document.getElementById("timer_card_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const openConfirmationResetModal = () => {
    const modal = document.getElementById("confirmation_reset_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  const openConfirmationLogoutModal = () => {
    const modal = document.getElementById("confirmation_logout_modal");
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  };

  return (
    <details className="dropdown dropdown-end dropdown-bottom">
      <summary className="btn btn-ghost my-2">
        {GearIcon ? (
          <Image
            alt="gear icon"
            src={GearIcon}
            width={20}
            height={20}
            className="dark:invert"
          />
        ) : (
          ""
        )}
      </summary>
      <div className="menu dropdown-content z-[100] grid w-48 md:w-56 grid-cols-2 md:grid-cols-1 rounded-box bg-base-100 p-2 shadow">
        <button className="btn m-1 text-xs md:text-base" onClick={() => openShoutoutModal()}>
          Shoutout
        </button>
        <button
          className="btn m-1 text-xs md:text-base"
          onClick={() => openBlacklistModal()}
        >
          Blacklist
        </button>
        <button
          className="btn m-1 text-xs md:text-base"
          onClick={() => openTimerCardModal()}
        >
          Timer Card
        </button>
        <button
          className="btn btn-error m-1 text-xs md:text-base"
          onClick={() => openConfirmationResetModal()}
        >
          Reset Attendance
        </button>
        <button
          className="btn m-1 hover:btn-error text-xs md:text-base"
          onClick={() => openConfirmationLogoutModal()}
        >
          Logout
        </button>
      </div>
    </details>
  )
}