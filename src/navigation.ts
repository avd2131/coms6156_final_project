import { verticalScrollStatus } from "./scroll";
import { Direction } from "./types/direction";
import { Keys, NavigationType } from "./types/keys";
import { getElementInDirection, getFirstScrollView, scrolledToBottom, scrolledToTop } from "./utils/element.utils";
import { onEventListenerStatusChange } from "./utils/eventHandling.utils";
import { Logger } from "./utils/logging.utils";
import { isKeyInProfile } from "./utils/navigationKeys.utils";

export let lastFocusedElement: HTMLElement | undefined;

export function setLastFocusedElement(element: HTMLElement) {
  lastFocusedElement = element;
}

const navigationType: NavigationType = NavigationType.ArrowKeys;
function getDirFromKey(key: string): Direction {
  // Exclude keys that are not part of navigation profile
  if (!isKeyInProfile(key, navigationType)) {
    return Direction.None;
  }

  switch (key.toLowerCase()) {
    case Keys.ArrowUp:
    case Keys.W:
      return Direction.Up;
    case Keys.ArrowDown:
    case Keys.S:
      return Direction.Down;
    case Keys.ArrowLeft:
    case Keys.A:
      return Direction.Left;
    case Keys.ArrowRight:
    case Keys.D:
      return Direction.Right;
    default:
      return Direction.None;
  }
}

const navigateOnKeydownCallback = (e: KeyboardEvent) => {
  navigate(getDirFromKey(e.key), e);
};

let logger: Logger | undefined;
export function initializeNavigationListeners(_logger?: Logger) {
  if (logger) logger = _logger;

  document.addEventListener("keydown", navigateOnKeydownCallback);
}

const clearNavigationListeners = () => document.removeEventListener("keydown", navigateOnKeydownCallback);

const scrollPauseInterval = 50;

let attemptingNavigation = false;
let keyPressDuringNavigation = false;
async function navigate(direction: Direction, keyboardEvent?: KeyboardEvent) {
  let nextEl: HTMLElement | undefined;

  if (direction === Direction.None) return;
  if (!lastFocusedElement) return;

  const fromKeypress = keyboardEvent !== undefined;

  if (!attemptingNavigation) keyPressDuringNavigation = false;
  if (attemptingNavigation && fromKeypress) keyPressDuringNavigation = true;

  // If we're navigating from a keypress, prevent the default action
  if (fromKeypress) {
    keyboardEvent.preventDefault();
  }

  switch (direction) {
    case Direction.Up: // Move up
      attemptingNavigation = true;

      nextEl = getElementInDirection(lastFocusedElement, Direction.Up);

      if (nextEl) {
        // Element found
        nextEl.focus();

        if (fromKeypress) logger?.logKeypress(keyboardEvent.key, direction, lastFocusedElement.tagName, nextEl.tagName);

        attemptingNavigation = false;
      } else {
        // No element found
        const scrollView = getFirstScrollView(lastFocusedElement);

        if (scrollView && !scrolledToTop(scrollView) && !keyPressDuringNavigation) {
          await sleep(scrollPauseInterval);

          scrollView.scrollBy(0, -300);

          navigate(Direction.Up);
        } else if (verticalScrollStatus !== "top" && verticalScrollStatus !== "noscroll" && !keyPressDuringNavigation) {
          // Scroll up and try looking for elements again
          await sleep(scrollPauseInterval);

          window.scrollBy(0, -300);

          navigate(Direction.Up);
        } else {
          if (fromKeypress) logger?.logKeypress(keyboardEvent.key, direction);

          attemptingNavigation = false;
        }
      }
      break;
    case Direction.Left: // Move left
      attemptingNavigation = true;

      nextEl = getElementInDirection(lastFocusedElement, Direction.Left);

      if (nextEl) {
        // Element found
        nextEl.focus();

        if (fromKeypress) logger?.logKeypress(keyboardEvent.key, direction, lastFocusedElement.tagName, nextEl.tagName);
      } else {
        if (fromKeypress) logger?.logKeypress(keyboardEvent.key, direction);
      }

      attemptingNavigation = false;
      break;
    case Direction.Down: // Move down
      attemptingNavigation = true;

      nextEl = getElementInDirection(lastFocusedElement, Direction.Down);

      if (nextEl) {
        console.log("focusing on element:", nextEl);

        // Element found
        nextEl.focus();

        if (fromKeypress) logger?.logKeypress(keyboardEvent.key, direction, lastFocusedElement.tagName, nextEl.tagName);

        attemptingNavigation = false;
      } else {
        // No element found
        const scrollView = getFirstScrollView(lastFocusedElement);
        if (scrollView && !scrolledToBottom(scrollView) && !keyPressDuringNavigation) {
          console.trace("scrolling down...");

          await sleep(scrollPauseInterval);

          scrollView.scrollBy(0, 300);

          navigate(Direction.Down);
        } else if (
          verticalScrollStatus !== "bottom" &&
          verticalScrollStatus !== "noscroll" &&
          !keyPressDuringNavigation
        ) {
          // Scroll down and try looking for elements again
          console.trace("scrolling down...");

          await sleep(scrollPauseInterval);

          window.scrollBy(0, 300);

          navigate(Direction.Down);
        } else {
          if (fromKeypress) logger?.logKeypress(keyboardEvent.key, direction);

          attemptingNavigation = false;
        }
      }
      break;
    case Direction.Right: // Move right
      attemptingNavigation = true;

      nextEl = getElementInDirection(lastFocusedElement, Direction.Right);

      if (nextEl) {
        // Element found
        nextEl.focus();

        if (fromKeypress) logger?.logKeypress(keyboardEvent.key, direction, lastFocusedElement.tagName, nextEl.tagName);
      } else {
        if (fromKeypress) logger?.logKeypress(keyboardEvent.key, direction);
      }

      attemptingNavigation = false;
      break;
  }
}

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

onEventListenerStatusChange({ onEnable: initializeNavigationListeners, onDisable: clearNavigationListeners });
