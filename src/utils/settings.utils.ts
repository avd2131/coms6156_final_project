import { DEFAULT_SETTINGS } from "../types/settings";

export const isExtensionEnabled = async () => {
  const { extensionEnabled } = await chrome.storage.sync.get(["extensionEnabled"]);
  return extensionEnabled ?? DEFAULT_SETTINGS.extensionEnabled;
};
