"use client";

import { useCallback, useEffect, useState } from "react";

import SettingsForm from "./components/form";
import { Skeleton } from "@/components/ui/skeleton";

import { Auth } from "@/types/auth";
import { Settings } from "@/types/settings";
import { SelectedChannel } from "@/types/channel";
import { PersistAuth, PersistChannel, PersistSettings } from "@/types/persist";

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
  const [channel] = usePersistState(
    PersistChannel.name,
    PersistChannel.defaultValue
  ) as [SelectedChannel];

  const [settings, setSettingsTemp] = useState<Settings>({
    autoSo: false,
    autoSoDelay: 0,
    blacklistUsernames: "",
    blacklistWords: "",
    raidPriority: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const updateSettings = useCallback((data: Settings) => {
    setSettings({ ...data });
  }, []);

  useEffect(() => {
    if (!auth.accessToken) return;

    getSettings(auth.user.login, channel.login, auth.accessToken).then(
      (res) => {
        if (res.status) {
          const data = res.data as Settings;
          setSettings(data);
          setSettingsTemp(data);
          setIsLoading(false);
          return;
        }
      }
    );
  }, [auth, channel]);

  return (
    <div className="mt-8">
      {isLoading && <Skeleton className="mt-4 h-[100px] rounded-md p-4" />}
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

const getSettings = async (login: string, toLogin: string, token: string) => {
  const res = await fetch(
    `/api/settings/list?login=${login}&toLogin=${toLogin}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    return {
      code: res.status,
      status: false,
    };
  }

  const data = await res.json();
  return data;
};
