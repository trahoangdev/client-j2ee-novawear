import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppSettings, StoreInfo, GeneralConfig } from '@/types/settings';
import {
  defaultAppSettings,
  getAppSettingsFromStorage,
  saveAppSettingsToStorage,
} from '@/types/settings';

interface AppSettingsContextValue {
  settings: AppSettings;
  setStore: (store: Partial<StoreInfo>) => void;
  setGeneral: (general: Partial<GeneralConfig>) => void;
  updateSettings: (next: Partial<AppSettings>) => void;
  save: () => void;
  resetToDefaults: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function mergeSettings(prev: AppSettings, next: Partial<AppSettings>): AppSettings {
  return {
    store: { ...prev.store, ...next.store },
    general: { ...prev.general, ...next.general },
    updatedAt: next.updatedAt ?? prev.updatedAt,
  };
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getAppSettingsFromStorage);

  const save = useCallback(() => {
    const next = { ...settings, updatedAt: Date.now() };
    setSettings(next);
    saveAppSettingsToStorage(next);
  }, [settings]);

  const updateSettings = useCallback((next: Partial<AppSettings>) => {
    setSettings((prev) => mergeSettings(prev, next));
  }, []);

  const setStore = useCallback((store: Partial<StoreInfo>) => {
    setSettings((prev) => ({ ...prev, store: { ...prev.store, ...store } }));
  }, []);

  const setGeneral = useCallback((general: Partial<GeneralConfig>) => {
    setSettings((prev) => ({ ...prev, general: { ...prev.general, ...general } }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultAppSettings);
    saveAppSettingsToStorage(defaultAppSettings);
  }, []);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      setStore,
      setGeneral,
      updateSettings,
      save,
      resetToDefaults,
    }),
    [settings, setStore, setGeneral, updateSettings, save, resetToDefaults]
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return ctx;
}

/** Chỉ lấy settings (read-only), không cần provider nếu chỉ đọc từ localStorage một lần */
export function useAppSettingsReadOnly(): AppSettings {
  const ctx = useContext(AppSettingsContext);
  return ctx?.settings ?? getAppSettingsFromStorage();
}
