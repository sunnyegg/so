"use client";

import { useCallback } from "react";

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
  const [settings, setSettings] = usePersistState(
    PersistSettings.name,
    PersistSettings.defaultValue
  ) as [Settings, React.Dispatch<React.SetStateAction<Settings>>];

  const updateSettings = useCallback((data: Settings) => {
    setSettings({ ...data });
  }, []);

  return (
    <div className="mt-8">
      {auth.accessToken && (
        <SettingsForm
          auth={auth}
          data={settings}
          updateSettings={updateSettings}
        />
      )}
    </div>
  );
}
