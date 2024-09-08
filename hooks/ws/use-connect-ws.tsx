import { useContext, useEffect, useRef, useState } from "react";

import { IWebsocketContext, WebsocketContext } from "@/context/websocket";

import { connectChat } from "../server/twitch";

export const useConnectWs = (token: string, userLogin: string, channel: string, streamId: number) => {
  const ws = useRef<WebSocket | null>(null);
  const { websocket, setWebsocket } = useContext(WebsocketContext) as IWebsocketContext;

  const [isConnected, setIsConnected] = useState(false);
  const [numberOfRetries, setNumberOfRetries] = useState(0);

  useEffect(() => {
    console.log('tes')
    if (!streamId) return;

    if (websocket) {
      ws.current = websocket;
      setIsConnected(true);
      return;
    }

    if (userLogin && !isConnected) {
      if (ws.current) return;

      if (numberOfRetries > 5) {
        return;
      }

      const wsconn = new WebSocket(process.env.NEXT_PUBLIC_WS_URL + `/${userLogin}` || "");
      wsconn.onopen = async () => {
        console.log("aaa")
        const { error } = await connectChat(token, userLogin, channel, streamId)
        if (error) {
          console.log(error)
          setIsConnected(false);
          setNumberOfRetries(numberOfRetries + 1);
          return;
        }
        setIsConnected(true);
      };
      wsconn.onclose = () => {
        setIsConnected(false);
        setNumberOfRetries(numberOfRetries + 1);
        ws.current = null;
      };
      ws.current = wsconn;
      setWebsocket(wsconn)
    }
  }, [websocket, userLogin, isConnected, numberOfRetries, channel, streamId]);

  return {
    ws,
    isConnected,
  };
};