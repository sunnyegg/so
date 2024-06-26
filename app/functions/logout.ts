import {
  ACCESS_TOKEN,
  APP_VERSION,
  CHATTERS_PRESENT,
  MY_SESSION,
  USER_CHANNEL_MODERATED,
  USER_SESSION,
} from "@/const/keys";

export default function Logout(success: any, setSuccess: any, session: any) {
  localStorage.removeItem(`${CHATTERS_PRESENT}-${session.id}`);
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(USER_SESSION);
  localStorage.removeItem(MY_SESSION);
  localStorage.removeItem(APP_VERSION);
  localStorage.removeItem(USER_CHANNEL_MODERATED);

  setSuccess([...success, `Logging out...`]);

  setTimeout(() => {
    location.reload();
  }, 1000);
}
