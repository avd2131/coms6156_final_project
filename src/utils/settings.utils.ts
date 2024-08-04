import { DEFAULT_SETTINGS, Settings } from "../types/settings";

export const isExtensionEnabled = async () => {
  const { extensionEnabled } = await chrome.storage.sync.get(["extensionEnabled"]);
  return extensionEnabled ?? DEFAULT_SETTINGS.extensionEnabled;
};

/**
 * Performs a shallow comparison of two `Settings` objects.
 */
export const areSettingsEqual: (a: Settings, b: Settings) => boolean = (a, b) => {
  return (
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every((key) => b.hasOwnProperty(key) && a[key as keyof Settings] === b[key as keyof Settings])
  );
};
