import { createContext } from "react";
import usePersistState from "@/hooks/common/use-persist-state";

export interface IAuthContext {
  auth: AuthData;
  setAuth: (auth: AuthData) => void;
}

export type AuthData = {
  access_token: string;
  refresh_token: string;
  user: {
    user_login: string;
    user_name: string;
    profile_image_url: string;
  };
}

const AuthContext = createContext<IAuthContext | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = usePersistState("auth", {
    access_token: "",
    refresh_token: "",
    user: {
      user_login: "",
      user_name: "",
      profile_image_url: "",
    },
  });

  return (
    <AuthContext.Provider value={{
      auth: auth,
      setAuth: setAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };