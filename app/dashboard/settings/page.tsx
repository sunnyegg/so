"use client";

import { useCallback } from "react";

import SettingsForm from "./components/form";
import StreamCard from "../components/stream";
import Divider from "@/components/common/divider";

import { Settings } from "@/types/settings";
import { PersistSettings } from "@/types/persist";

import usePersistState from "@/hooks/use-persist-state";

export default function SettingsPage() {
  const [settings, setSettings] = usePersistState(
    PersistSettings.name,
    PersistSettings.defaultValue
  ) as [Settings, React.Dispatch<React.SetStateAction<Settings>>];

  const updateSettings = useCallback((data: Settings) => {
    setSettings({ ...data });
  }, []);

  return (
    <div className="mt-8">
      <StreamCard />

      <Divider />

      {settings.autoSo !== undefined && (
        <SettingsForm data={settings} updateSettings={updateSettings} />
      )}
    </div>
  );
}
