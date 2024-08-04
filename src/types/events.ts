export enum EventType {
  Popup = "popup-event",
  EventListeners = "event-listeners",
}

export enum PopupEventType {
  EnableEventListeners = "enable-event-listeners",
  DisableEventListeners = "disable-event-listeners",
  OutlineElements = "outline-elements",
  ClearOutlines = "clear-outlines",
}

export enum EventListenersEventType {
  EnableListeners = "enable",
  DisableListeners = "disable",
}
