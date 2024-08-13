import { createContext, Dispatch, SetStateAction, useState } from "react";

export interface IWebsocketContext {
  isConnected: boolean;
  websocket: WebSocket | null;
  setWebsocket: Dispatch<SetStateAction<WebsocketData>>
  setIsConnected: Dispatch<SetStateAction<boolean>>
}

export type WebsocketData = WebSocket | null

const WebsocketContext = createContext<IWebsocketContext | null>(null);

const WebsocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [websocket, setWebsocket] = useState<WebsocketData>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  return (
    <WebsocketContext.Provider value={{
      isConnected: isConnected,
      websocket: websocket,
      setWebsocket: setWebsocket,
      setIsConnected: setIsConnected,
    }}>
      {children}
    </WebsocketContext.Provider>
  );
}

export { WebsocketContext, WebsocketProvider };