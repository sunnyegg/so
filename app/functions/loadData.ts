import { Channel, UserSession } from "../types";
import {
  ACCESS_TOKEN,
  AUTO_SO_DELAY,
  IS_AUTO_SO_ENABLED,
  IS_SO_ENABLED,
  MY_SESSION,
  TIMER_CARD,
  TITLE_STREAM,
  USER_CHANNEL_MODERATED,
  USER_SESSION,
} from "@/const/keys";

export default async function LoadData(
  setSession: any,
  setMySession: any,
  setChannels: any,
  setToken: any,
  setTimerValue: any,
  errors: any,
  setErrors: any,
  setCurrentSoStatus: any,
  setCurrentAutoSoStatus: any,
  setCurrentAutoSoDelay: any
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

    const currentSoStatus = localStorage.getItem(IS_SO_ENABLED);
    if (currentSoStatus === null) {
      setCurrentSoStatus(true);
    } else {
      setCurrentSoStatus(currentSoStatus === "true" ? true : false);
    }

    const currentAutoSoStatus = localStorage.getItem(IS_AUTO_SO_ENABLED);
    if (currentAutoSoStatus === null) {
      setCurrentAutoSoStatus(false);
    } else {
      setCurrentAutoSoStatus(currentAutoSoStatus === "true" ? true : false);
    }

    const currentAutoSoDelay = localStorage.getItem(AUTO_SO_DELAY);
    if (currentAutoSoDelay === null) {
      setCurrentAutoSoDelay(0);
    } else {
      setCurrentAutoSoDelay(Number(currentAutoSoDelay));
    }

    const isTitleSame = await checkTitleStream(accessToken, savedUserSession);
    if (isTitleSame.isError) {
      console.error(isTitleSame.data);
    }

    if (!isTitleSame.data) {
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/supabase/analytics/insert`,
        {
          headers: {
            token: accessToken,
          },
          body: JSON.stringify({
            username: savedMySession.name,
            type: "open",
          }),
          method: "POST",
        }
      ).catch((err) => console.error(err.message));
    }
  } catch (error: any) {
    console.error(error.message);
    if (error.message === "something went wrong with token") {
      setErrors([...errors, "Please login/relogin"]);
    } else {
      setErrors([...errors, "unexpected error on load data"]);
    }
  }
}

const checkTitleStream = async (token: any, session: any) => {
  try {
    let output = false;

    const resChannel = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/channels?broadcasterId=broadcaster_id=${session.id}`,
      {
        headers: { token },
      }
    );
    if (!resChannel.ok) {
      const errChannel = await resChannel.json();
      throw new Error(errChannel.error);
    }
    const { data } = await resChannel.json();

    const dataLocal = localStorage.getItem(TITLE_STREAM);
    if (dataLocal === null) {
      localStorage.setItem(TITLE_STREAM, data.data[0].title);
    }

    // check apakah data yg di local sama dengan yg baru
    if (dataLocal === data.data[0].title) {
      output = true;
    } else {
      localStorage.setItem(TITLE_STREAM, data.data[0].title);
    }

    return {
      isError: false,
      data: output,
    };
  } catch (err: any) {
    return {
      isError: true,
      data: err.message,
    };
  }
};
