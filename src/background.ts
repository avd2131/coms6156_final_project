import { Commands } from "./types/commands";
import { EventListenersEventType, EventType } from "./types/events";

chrome.commands.onCommand.addListener((command) => {
  if (command === Commands.ToggleExtension) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: Commands.ToggleExtension });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only listen to event coming from the content script
  if (
    message.type !== EventListenersEventType.EnableListenersFromContent &&
    message.type !== EventListenersEventType.DisableListenersFromContent
  )
    return;

  const enableListeners = message.type === EventListenersEventType.EnableListenersFromContent;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].id)
      chrome.tabs.sendMessage(tabs[0].id, {
        type: EventType.EventListeners,
        data: enableListeners ? EventListenersEventType.EnableListeners : EventListenersEventType.DisableListeners,
      });
  });
});
