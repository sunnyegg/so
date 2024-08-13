import { createContext, useCallback } from "react";
import usePersistState from "@/hooks/common/use-persist-state";

export interface IShoutoutContext {
  shoutouts: ShoutoutData[];
  setShoutouts: (shoutouts: ShoutoutData[]) => void;
  addShoutout: (shoutout: ShoutoutData) => void;
  removeShoutout: (id: string) => void;
}

export type ShoutoutData = {
  id: string;
  avatar: string | undefined;
  channel: string;
  userName: string;
  userLogin: string;
  followers: number;
  lastSeenPlaying: string;
}

const ShoutoutContext = createContext<IShoutoutContext | null>(null);

const ShoutoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [shoutouts, setShoutouts] = usePersistState("shoutouts", []);

  const addShoutout = useCallback((shoutout: ShoutoutData) => {
    const id = Date.now().toString();
    setShoutouts((prevShoutouts: ShoutoutData[]) => [...prevShoutouts, { ...shoutout, id }]);
  }, [])

  const removeShoutout = useCallback((id: string) => {
    setShoutouts((prevShoutouts: ShoutoutData[]) => prevShoutouts.filter(item => item.id !== id));
  }, [])

  return (
    <ShoutoutContext.Provider value={{
      shoutouts: shoutouts,
      setShoutouts: setShoutouts,
      addShoutout: addShoutout,
      removeShoutout: removeShoutout,
    }}>
      {children}
    </ShoutoutContext.Provider>
  );
}

export { ShoutoutContext, ShoutoutProvider };