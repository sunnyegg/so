import type { NextApiRequest, NextApiResponse } from "next";
import tmi from "tmi.js";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = "oauth:" + req.body.accessToken;

  const client = new tmi.Client({
    options: { debug: true },
    identity: {
      username: "sunnyegg21",
      password: accessToken,
    },
    channels: ["sunnyegg21"],
  });

  client.connect();

  client.on("message", (channel, tags, message, self) => {
    console.log(message);
    // Ignore echoed messages.
    if (self) return;

    if (message.toLowerCase() === "!hello") {
      // "@alca, heya!"
      client.say(channel, `@${tags.username}, heya!`);
    }
  });

  res.send("ok");
}
