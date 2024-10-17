"use client";

import { useCallback, useEffect, useState } from "react";

import SettingsForm from "./components/form";

import { Auth } from "@/types/auth";
import { Settings } from "@/types/settings";
import { PersistAuth, PersistSettings } from "@/types/persist";

import usePersistState from "@/hooks/use-persist-state";

export default function SettingsPage() {
  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];
  const [_, setSettings] = usePersistState(
    PersistSettings.name,
    PersistSettings.defaultValue
  ) as [Settings, React.Dispatch<React.SetStateAction<Settings>>];

  const [settings, setSettingsTemp] = useState<Settings>({
    autoSo: false,
    autoSoDelay: 0,
    blacklistUsernames: "",
    blacklistWords: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const updateSettings = useCallback((data: Settings) => {
    setSettings({ ...data });
  }, []);

  useEffect(() => {
    if (!auth.accessToken) return;

    getSettings(auth.user.login, auth.accessToken).then((res) => {
      if (res.status) {
        const data = res.data as Settings;
        setSettings(data);
        setSettingsTemp(data);
        setIsLoading(false);
        return;
      }
    });
  }, [auth]);

  return (
    <div className="mt-8">
      {auth.accessToken && !isLoading && (
        <SettingsForm
          auth={auth}
          data={settings}
          updateSettings={updateSettings}
        />
      )}
    </div>
  );
}

const getSettings = async (login: string, token: string) => {
  const res = await fetch(`/api/settings/list?login=${login}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    return {
      code: res.status,
      status: false,
    };
  }

  const data = await res.json();
  return data;
};
