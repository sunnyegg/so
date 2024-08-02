import { createContext, useState } from "react";

export interface ISuccessContext {
  successes: string[];
  setSuccesses: (successes: string[]) => void;
}

const SuccessContext = createContext<ISuccessContext | null>(null);

const SuccessProvider = ({ children }: { children: React.ReactNode }) => {
  const [successes, setSuccesses] = useState<string[]>([]);

  return (
    <SuccessContext.Provider value={{
      successes: successes,
      setSuccesses: setSuccesses,
    }}>
      {children}
    </SuccessContext.Provider>
  );
}

export { SuccessContext, SuccessProvider };