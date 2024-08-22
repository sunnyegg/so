import { createContext } from "react";
import browserStorage from 'store';
import { useRouter } from "next/navigation";

import usePersistState from "@/hooks/common/use-persist-state";

import { AUTH } from "./types";

import useRefreshToken from "@/hooks/auth/use-refresh-token";

export interface IAuthContext {
  auth: AuthData;
  setAuth: (auth: AuthData) => void;
  refreshAuth: () => Promise<string>;
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
  const [auth, setAuth] = usePersistState(AUTH, {
    access_token: "",
    refresh_token: "",
    user: {
      user_login: "",
      user_name: "",
      profile_image_url: "",
    },
  });
  const router = useRouter();

  const refreshAuth = async () => {
    if (auth.access_token !== "" && auth.refresh_token !== "") {
      const { error, data } = await useRefreshToken(auth.access_token, auth.refresh_token);
      if (error) {
        router.push("/");
        return "";
      }

      setAuth({ ...auth, access_token: data })
      return data;
    }

    return "";
  }

  return (
    <AuthContext.Provider value={{
      auth: auth,
      setAuth: setAuth,
      refreshAuth: refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };