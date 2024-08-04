import { EventListenersEventType, EventType } from "../types/events";

/**
 * Listens for messages from the background script to enable or disable event listeners.
 *
 * This function standardizes the process for recognizing event listener enable/disable event
 * and acting on it in different content scripts.
 */
export function onEventListenerStatusChange(props: { onEnable: () => void; onDisable: () => void }) {
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === EventType.EventListeners) {
      if (message.data === EventListenersEventType.EnableListeners) {
        props.onEnable();
      }

      if (message.data === EventListenersEventType.DisableListeners) {
        props.onDisable();
      }
    }
  });
}
