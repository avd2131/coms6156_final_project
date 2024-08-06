import { Commands } from "./types/commands";
import { EventListenersEventType } from "./types/events";
import { isExtensionEnabled } from "./utils/settings.utils";

export const initializeExtensionToggleListener = () => {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === Commands.ToggleExtension) {
      const extensionEnabled = await isExtensionEnabled();

      try {
        chrome.runtime.sendMessage({
          type: extensionEnabled
            ? EventListenersEventType.DisableListenersFromContent
            : EventListenersEventType.EnableListenersFromContent,
        });

        chrome.storage.sync.set({ extensionEnabled: !extensionEnabled });
      } catch (e) {
        console.error("Failed to toggle extension", e);
      }
    }
  });
};
