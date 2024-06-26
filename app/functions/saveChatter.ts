import { Chatters } from "../types";

export default function SaveChatter(
  tags: any,
  userData: any,
  followerData: any,
  channelData: any,
  setChattersTemp: any
) {
  const chatter: Chatters = {
    id: tags["user-id"] || "",
    type: "",
    name: tags["display-name"] || "",
    image: userData.data[0].profile_image_url,
    username: tags.username || "",
    followers: followerData.total,
    description: "",
    lastStreamed: channelData.data[0].game_name,
    shown: false,
  };

  setChattersTemp(chatter);
}
