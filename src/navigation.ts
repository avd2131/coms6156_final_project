import { getElementInDirection, getFirstScrollView, scrolledToBottom, scrolledToTop } from "./elementUtils";
import { verticalScrollStatus } from "./scroll";
import { Direction } from "./types/direction";
import { Keys } from "./types/keys";

export let lastFocusedElement: HTMLElement | undefined;

export function setLastFocusedElement(element: HTMLElement) {
  lastFocusedElement = element;
}

function getDirFromKey(key: string, defaultDirection = Direction.Up): Direction {
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
      return defaultDirection;
  }
}

export function initializeNavigationListeners() {
  document.addEventListener("keydown", async (e) => {
    navigate(getDirFromKey(e.key), true);
  });
}

const scrollPauseInterval = 50;

let attemptingNavigation = false;
let keyPressDuringNavigation = false;
async function navigate(direction: Direction, fromKeypress: boolean) {
  let nextEl: HTMLElement | undefined;

  if (!lastFocusedElement) return;

  if (!attemptingNavigation) keyPressDuringNavigation = false;
  if (attemptingNavigation && fromKeypress) keyPressDuringNavigation = true;

  switch (direction) {
    case Direction.Up: // Move up
      attemptingNavigation = true;

      nextEl = getElementInDirection(lastFocusedElement, Direction.Up);

      if (nextEl) {
        // Element found
        nextEl.focus();

        attemptingNavigation = false;
      } else {
        // No element found
        const scrollView = getFirstScrollView(lastFocusedElement);

        if (scrollView && !scrolledToTop(scrollView) && !keyPressDuringNavigation) {
          await sleep(scrollPauseInterval);

          scrollView.scrollBy(0, -300);

          navigate(Direction.Up, false);
        } else if (verticalScrollStatus !== "top" && verticalScrollStatus !== "noscroll" && !keyPressDuringNavigation) {
          // Scroll up and try looking for elements again
          await sleep(scrollPauseInterval);

          window.scrollBy(0, -300);

          navigate(Direction.Up, false);
        } else attemptingNavigation = false;
      }
      break;
    case Direction.Left: // Move left
      attemptingNavigation = true;

      nextEl = getElementInDirection(lastFocusedElement, Direction.Left);

      if (nextEl) {
        // Element found
        nextEl.focus();
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

        attemptingNavigation = false;
      } else {
        // No element found
        const scrollView = getFirstScrollView(lastFocusedElement);
        if (scrollView && !scrolledToBottom(scrollView) && !keyPressDuringNavigation) {
          console.trace("scrolling down...");

          await sleep(scrollPauseInterval);

          scrollView.scrollBy(0, 300);

          navigate(Direction.Down, false);
        } else if (
          verticalScrollStatus !== "bottom" &&
          verticalScrollStatus !== "noscroll" &&
          !keyPressDuringNavigation
        ) {
          // Scroll down and try looking for elements again
          console.trace("scrolling down...");

          await sleep(scrollPauseInterval);

          window.scrollBy(0, 300);

          navigate(Direction.Down, false);
        } else attemptingNavigation = false;
      }
      break;
    case Direction.Right: // Move right
      attemptingNavigation = true;

      nextEl = getElementInDirection(lastFocusedElement, Direction.Right);

      if (nextEl) {
        // Element found
        nextEl.focus();
      }

      attemptingNavigation = false;

      break;
  }
}

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
