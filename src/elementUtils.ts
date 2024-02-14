import { Direction } from "./direction";
import { getReadout } from "./textContent";

let detailedLogging = false;
chrome.storage.sync.get(["detailedLogging"], (items) => {
  detailedLogging = items.detailedLogging ?? false;
});

/** Gets the horizontal/vertical bias of an onscreen element. Returns x/y biases bounded by -1 & 1. (0 signifies center of screen) */
export function getBias(element: HTMLElement, roundToTenth = true): { x: number; y: number } {
  const midpoint = getElementMidpoint(element);

  const bias = { x: midpoint.x / window.innerWidth, y: midpoint.y / window.innerHeight };

  let xBias = Math.min(Math.max(-1 + 2 * bias.x, -1), 1); // Clamps xBias between -1 and 1. If the element is off screen in any horizontal direction, its bias will be limited to -1 or 1.
  let yBias = Math.min(Math.max(1 - 2 * bias.y, -1), 1); // Clamps yBias between -1 and 1. If the element is off screen in any vertical direction, its bias will be limited to -1 or 1.

  if (roundToTenth) {
    xBias = Math.round(xBias * 10) / 10;
    yBias = Math.round(yBias * 10) / 10;
  }

  return { x: xBias, y: yBias };
}

export function getElementMidpoint(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  // Get midpoint of element (https://javascript.info/coordinates)
  return { x: rect.left + rect.width / 2, y: rect.bottom - rect.height / 2 };
}

const baseBuffer = 5;
let buffer = baseBuffer; //px
export function getElementStartingPoints(element: HTMLElement, dir: Direction) {
  if (!element) {
    console.error("Provided element doesn't exist.");
    return undefined;
  }

  const rect = element.getBoundingClientRect();

  buffer = baseBuffer + rect.height / 100;

  switch (dir) {
    case Direction.Left:
      return [
        { x: rect.left, y: rect.bottom - buffer },
        { x: rect.left, y: rect.bottom - rect.height / 2 },
        { x: rect.left, y: rect.top + buffer },
      ];
    case Direction.Right:
      return [
        { x: rect.right, y: rect.bottom - buffer },
        { x: rect.right, y: rect.bottom - rect.height / 2 },
        { x: rect.right, y: rect.top + buffer },
      ];
    case Direction.Up:
      return [
        { x: rect.left + buffer, y: rect.top },
        { x: rect.left + rect.width / 2, y: rect.top },
        { x: rect.right - buffer, y: rect.top },
      ];
    case Direction.Down:
      return [
        { x: rect.left + buffer, y: rect.bottom },
        { x: rect.left + rect.width / 2, y: rect.bottom },
        { x: rect.right - buffer, y: rect.bottom },
      ];
    default:
      console.error("Unknown direction:", dir);
      return undefined;
  }
}

export function worthNavigatingTo(
  startingElement: HTMLElement,
  destinationElement: HTMLElement,
  dir: Direction,
  alt = false
): boolean | HTMLElement {
  if (!startingElement || !destinationElement) return false;

  if (startingElement === destinationElement || elementsRelated(startingElement, destinationElement)) return false;

  const destinationComputedStyle = getComputedStyle(destinationElement);

  if (destinationComputedStyle.display === "none") return false;

  if (detailedLogging) console.log("Checking if element", destinationElement, "is worth navigating to.");

  // Searches children/parent for valid alternative if element is not suitable for reading. Can result in unintuitive navigation, but solves the problem of missing many elements at a time.
  if (getReadout(destinationElement) === "") {
    if (alt) {
      if (destinationElement.parentElement)
        if (worthNavigatingTo(startingElement, destinationElement.parentElement, dir))
          return destinationElement.parentElement as HTMLElement;

      const sortedChildren = sortByEdge(destinationElement.children, dir);

      for (var i = 0; i < sortedChildren.length; i++) {
        const child = sortedChildren[i];
        if (worthNavigatingTo(startingElement, child as HTMLElement, dir)) {
          return child as HTMLElement;
        } else {
          return worthNavigatingTo(startingElement, child as HTMLElement, dir, true);
        }
      }
    } else return false;
  }

  const startElRect = startingElement.getBoundingClientRect();
  const destElRect = destinationElement.getBoundingClientRect();

  /** Nearest parent scroll view to starting element (if it exists) */
  const startElScrollView = getFirstScrollView(startingElement);
  /** Nearest parent scroll view to destination element (if it exists) */
  const destElScrollView = getFirstScrollView(destinationElement);

  /** Is the starting element fixed? */
  const startElFixed = getFixedParent(startingElement) ? true : false;
  /** Is the destination element fixed? */
  const destElFixed = getFixedParent(destinationElement) ? true : false;

  const elementsInSameScrollView =
    startElScrollView?.contains(startingElement) && startElScrollView?.contains(destinationElement);

  switch (dir) {
    case Direction.Up:
      // If the top border of the destination element is lower/equal to than the current element's top border,
      // don't mark this the destination element as worth navigating to. Same logic extends to the other three cases.
      if (startElRect.top <= destElRect.top) return false;

      // If the current element isn't in a scrollview or it's fixed, the destination element should be considered navigable.
      if (!startElScrollView || startElFixed) return true;

      if (
        scrolledToTop(startElScrollView) ||
        (startElScrollView.contains(destinationElement) && !destElFixed) ||
        (elementsInSameScrollView && startElScrollView !== document.documentElement)
      ) {
        // Good
      } else if (destElScrollView && startElScrollView !== destElScrollView) {
        // Good
      } else {
        if (detailedLogging)
          console.log(
            "returning element",
            destinationElement,
            "as undefined.",
            inScrollView(startingElement),
            scrolledToBottom(startElScrollView)
          );
        return false;
      }
      break;
    case Direction.Down:
      if (startElRect.bottom >= destElRect.bottom) return false;

      // If the current element isn't in a scrollview or it's fixed, the destination element should be considered navigable.
      if (!startElScrollView || startElFixed) return true;

      let sharedParent;

      if (
        scrolledToBottom(startElScrollView) ||
        (startElScrollView.contains(destinationElement) && !getFixedParent(destinationElement)) ||
        (elementsInSameScrollView && startElScrollView !== document.documentElement)
      ) {
        // Good
      } else if (destElScrollView && startElScrollView !== destElScrollView) {
        // Good
      } else if ((sharedParent = getSharedParent(startingElement, destinationElement))) {
        if (startElScrollView.contains(sharedParent)) {
          // Good
        } else return false;
      } else {
        if (detailedLogging)
          console.log(
            "returning element",
            destinationElement,
            "as undefined.",
            inScrollView(startingElement),
            scrolledToBottom(startElScrollView)
          );
        return false;
      }
      break;
    case Direction.Left:
      if (startElRect.left <= destElRect.left) return false;
      break;
    case Direction.Right:
      if (startElRect.right >= destElRect.right) return false;
      break;
  }

  return true;
}

/** Gets element in a certain direction (up, down, left, right)
 * - Element is only detected if readable by `getReadout()` in textContent.ts
 */
export function getElementInDirection(
  startingElement: HTMLElement | undefined,
  dir: Direction
): HTMLElement | undefined {
  let nextEl: HTMLElement | undefined;

  if (!startingElement) return undefined;

  nextEl = startingElement;
  const rect = startingElement.getBoundingClientRect();

  switch (dir) {
    case Direction.Left:
      nextEl = getElementInRegion({
        startingElement,
        dir,
        minX: -1,
        maxX: rect.left,
        topY: rect.top,
        bottomY: rect.bottom,
      });
      break;
    case Direction.Up:
      nextEl = getElementInRegion({
        startingElement,
        dir,
        minX: rect.left,
        maxX: rect.right,
        topY: -1,
        bottomY: rect.top,
      });
      break;
    case Direction.Right:
      nextEl = getElementInRegion({
        startingElement,
        dir,
        minX: rect.right,
        maxX: -1,
        topY: rect.top,
        bottomY: rect.bottom,
      });
      break;
    case Direction.Down:
      nextEl = getElementInRegion({
        startingElement,
        dir,
        minX: rect.left,
        maxX: rect.right,
        topY: rect.bottom,
        bottomY: -1,
      });
      break;
  }

  if (detailedLogging)
    console.log(`Chosen element in ${dir} direction:`, nextEl, "; starting element:", startingElement);

  nextEl?.setAttribute("tabindex", "-1");
  return nextEl;
}

/** Determines if two elements are related to each other (returns true if `firstElement` is a parent/child of `secondElement`) */
function elementsRelated(firstElement: HTMLElement, secondElement: HTMLElement) {
  return firstElement.contains(secondElement) || secondElement.contains(firstElement);
}

// Increase interval for lower precision, but higher performance
interface GetElementInRegionOptions {
  startingElement: HTMLElement;
  minX: number;
  maxX: number;
  topY: number;
  bottomY: number;
  dir: Direction;
  interval?: number;
}

function getElementInRegion({
  startingElement,
  dir,
  minX,
  maxX,
  topY,
  bottomY,
  interval = 15,
}: GetElementInRegionOptions): HTMLElement | undefined {
  if (minX === -1) minX = 0;
  if (maxX === -1) maxX = window.innerWidth;
  if (topY === -1) topY = 0;
  if (bottomY === -1) bottomY = window.innerHeight;

  if (topY < 0) topY = 0;

  if (detailedLogging) console.log(`%cRegion bounds - x: ${minX}-${maxX}; y: ${topY}-${bottomY}`, "color: skyblue");

  /*
   * Iterating y-value based on direction
   * - Up: bottom-up (highest to lowest y-value)
   * - Down: top-down (lowest to highest y-value)
   * - Left: top-down (lowest to highest y-value)
   * - Right: top-down (lowest to highest y-value)
   */

  let horizontalInterval = interval;
  let verticalInterval = interval;

  // Increased precision for smaller regions
  if (horizontalInterval / (maxX - minX) < 3) horizontalInterval /= 2;
  if (verticalInterval / (bottomY - topY) < 3) verticalInterval /= 2;

  switch (dir) {
    case Direction.Left:
      if (detailedLogging) console.log(`%c Navigating left`, "color: skyblue");

      for (let x = maxX; x >= minX; x -= horizontalInterval) {
        for (let y = topY; y <= bottomY; y += verticalInterval) {
          let elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;

          if (detailedLogging) console.log(`%cSearching for element at (${x}, ${y})`, "color: yellow", elementAtPoint);

          let p;
          if ((p = worthNavigatingTo(startingElement, elementAtPoint, dir, true))) {
            if (typeof p !== "boolean") {
              elementAtPoint = p;
            }

            if (getReadout(elementAtPoint) !== "") {
              if (detailedLogging) console.log("Element found: ", elementAtPoint);
              return elementAtPoint;
            }
          }
        }
      }
      break;
    case Direction.Right:
      if (detailedLogging) console.log(`%c Navigating right`, "color: skyblue");

      for (let x = minX; x <= maxX; x += horizontalInterval) {
        for (let y = topY; y <= bottomY; y += verticalInterval) {
          let elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;

          if (detailedLogging) console.log(`%cSearching for element at (${x}, ${y})`, "color: yellow", elementAtPoint);

          let p;
          if ((p = worthNavigatingTo(startingElement, elementAtPoint, dir, true))) {
            if (typeof p !== "boolean") {
              elementAtPoint = p;
            }

            if (getReadout(elementAtPoint) !== "") {
              if (detailedLogging) console.log("Element found: ", elementAtPoint);
              return elementAtPoint;
            }
          }
        }
      }
      break;
    case Direction.Up:
      if (detailedLogging) console.log("%c Navigating up", "color: skyblue");

      for (let y = bottomY; y >= topY; y -= verticalInterval) {
        for (let x = minX; x <= maxX; x += horizontalInterval) {
          let elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;

          if (detailedLogging) console.log(`%cSearching for element at (${x}, ${y})`, "color: yellow", elementAtPoint);

          let p;
          if ((p = worthNavigatingTo(startingElement, elementAtPoint, dir, true))) {
            if (typeof p !== "boolean") {
              elementAtPoint = p;
            }

            if (getReadout(elementAtPoint) !== "") {
              if (detailedLogging) console.log("Element found: ", elementAtPoint);
              return elementAtPoint;
            }
          }
        }
      }
      break;
    case Direction.Down:
      if (detailedLogging) console.log("%c Navigating down", "color: skyblue");

      for (let y = topY; y <= bottomY; y += verticalInterval) {
        for (let x = minX; x <= maxX; x += horizontalInterval) {
          let elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;

          if (detailedLogging) console.log(`%cSearching for element at (${x}, ${y})`, "color: yellow", elementAtPoint);

          let p;
          if ((p = worthNavigatingTo(startingElement, elementAtPoint, dir, true))) {
            if (typeof p !== "boolean") {
              elementAtPoint = p;
            }

            if (getReadout(elementAtPoint) !== "") {
              if (detailedLogging) console.log("Element found: ", elementAtPoint);
              return elementAtPoint;
            }
          }
        }
      }
      break;
  }

  return undefined;
}

const textTypes = ["p", "b", "span", "strong", "em", "q", "s", "sub", "sup", "u"];
export function hasNonTextChildren(element: HTMLElement): boolean {
  for (let i = 0; i < element.children.length; i++) {
    const childElementType = element.children[i].tagName.toLowerCase();

    if (!textTypes.includes(childElementType)) return true;
  }

  return false;
}

/** Returns the fixed element that is the parent of the given element. */
export function getFixedParent(element: HTMLElement): HTMLElement | undefined {
  while (element.parentElement) {
    const computedStyle = getComputedStyle(element);

    if (computedStyle.position === "sticky" || computedStyle.position === "fixed") return element;

    element = element.parentElement;
  }

  return undefined;
}

/** Returns true if the element is a child of a scroll view */
export function inScrollView(element: HTMLElement): boolean {
  let currentElement: HTMLElement | undefined = element;

  if (getFixedParent(currentElement)) return false;

  return getFirstScrollView(currentElement) ? true : false;
}

/** Returns true if the element has scrolled to the top of the scroll view */
export function scrolledToTop(scrollView: HTMLElement): boolean {
  return scrollView.scrollTop === 0;
}

/** Returns true if the element has scrolled to the bottom of the scroll view */
export function scrolledToBottom(scrollView: HTMLElement): boolean {
  return scrollView.scrollTop === scrollView.scrollHeight - scrollView.clientHeight;
}

/** Gets the first scroll view that the element is a child of.
 * - If the element is not a child of a scroll view, this returns undefined.
 */
export function getFirstScrollView(element: HTMLElement): HTMLElement | undefined {
  let currentElement: HTMLElement | undefined = element;

  while (currentElement) {
    const computedStyle = getComputedStyle(currentElement);
    if (currentElement.scrollHeight > currentElement.clientHeight && computedStyle.overflowY !== "hidden") {
      // Janky test to tell if an element is a valid scroll view or not. If we set the scroll position to 1 and it stays locked at 0, then in reality, it can't scroll.
      if (currentElement.scrollTop === 0) {
        currentElement.scrollTop = 1;

        if (currentElement.scrollTop > 0) {
          currentElement.scrollTop = 0;
          return currentElement;
        }
      } else return currentElement;
    }

    // Set the current element to its parent. If the parent is null, then we've reached the top of the DOM tree and should return undefined.
    currentElement = currentElement.parentElement ?? undefined;
  }

  return undefined;
}

function sortByEdge(elements: HTMLCollection, direction: Direction): HTMLElement[] {
  const sortedElements = Array.from(elements).sort((a, b) => {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    switch (direction) {
      case Direction.Up:
        // highest bottom values first
        return bRect.bottom - aRect.bottom;
      case Direction.Down:
        // lowest top values first
        return aRect.top - bRect.top;
      case Direction.Left:
        // highest right values first
        return bRect.right - aRect.right;
      case Direction.Right:
        // lowest left values first
        return aRect.left - bRect.left;
      default:
        return 0;
    }
  });

  return sortedElements as HTMLElement[];
}

export function getSharedParent(element1: HTMLElement, element2: HTMLElement): HTMLElement | undefined {
  let ancestor: HTMLElement | undefined = element1;

  while (ancestor) {
    if (ancestor.contains(element2)) break;

    ancestor = ancestor.parentElement ?? undefined;
  }

  return ancestor;
}
