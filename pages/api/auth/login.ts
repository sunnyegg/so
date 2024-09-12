import fs from "fs/promises";

export default async function handler(req, res) {
  try {
    const { code, scope, state } = req.query;
    console.log(code, scope, state);

    const savedState = await fs.readFile("state.json", "utf8");
    const { state: savedStateString } = JSON.parse(savedState);

    if (state !== savedStateString) {
      return res.status(403).json({ status: false, error: "Invalid state" });
    }

    // const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    // const CLIENT_SECRET = process.env.NEXT_TWITCH_CLIENT_SECRET;
    // const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + "/";

    // const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
    // console.log(url);

    // const response = await fetch(url, {
    //   method: "POST",
    // });

    // if (!response.ok) {
    //   return res.status(500).json({ status: false, error: "Failed to login" });
    // }

    // const data = await response.json();

    return res.status(200).json({ status: true });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ status: false });
  } finally {
    await fs.unlink("state.json");
  }
}
