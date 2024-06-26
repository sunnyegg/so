import { Channel, UserSession } from "../types";
import {
  ACCESS_TOKEN,
  MY_SESSION,
  TIMER_CARD,
  USER_CHANNEL_MODERATED,
  USER_SESSION,
} from "@/const/keys";

export default function LoadData(
  setSession: any,
  setMySession: any,
  setChannels: any,
  setToken: any,
  setTimerValue: any
) {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN) || "";
    if (!accessToken) {
      throw new Error("something went wrong with token");
    }

    setToken(accessToken);

    const savedUserSession: UserSession = localStorage.getItem(USER_SESSION)
      ? JSON.parse(localStorage.getItem(USER_SESSION) || "")
      : {
          id: "",
          image: "",
          name: "",
        };
    setSession(savedUserSession);

    const savedMySession: UserSession = localStorage.getItem(MY_SESSION)
      ? JSON.parse(localStorage.getItem(MY_SESSION) || "")
      : {
          id: "",
          image: "",
          name: "",
        };
    setMySession(savedMySession);

    const savedChannels: Channel[] = localStorage.getItem(
      USER_CHANNEL_MODERATED
    )
      ? JSON.parse(localStorage.getItem(USER_CHANNEL_MODERATED) || "")
      : [];
    setChannels(savedChannels);

    const currentTimer = localStorage.getItem(TIMER_CARD) || "60";
    setTimerValue(currentTimer);
  } catch (error: any) {
    console.error(error.message);
    localStorage.clear();
  }
}
