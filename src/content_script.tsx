import { playSound } from "./audioPlayer";
import { initializeNavigationListeners, lastFocusedElement, setLastFocusedElement } from "./navigation";
import { getReadout } from "./textContent";
import { ScrollSettings, Settings } from "./types/settings";
import { getBias } from "./utils/element.utils";
import { isExtensionEnabled } from "./utils/settings.utils";

console.log("%cSpatial Interactions Extension: Content script loaded!", "color: green; font-style: bold");

const initialize = async () => {
  // Set up 'WASD' navigation
  const extensionEnabled = await isExtensionEnabled();
  if (!extensionEnabled) return;

  initializeNavigationListeners();
  initializeFocusHandlers();
};

// Detects which element is currently being focused on and gives it a border
let lastScrollYPos = window.scrollY;
let styledElements: HTMLElement[] = [];
let firstFocus = true;
const initializeFocusHandlers = () => {
  document.addEventListener(
    "focusin",
    async () => {
      const { scrollFeedback, spatializeScrollFeedback, mute } = await getScrollSoundSettings();

      firstFocus = false;

      const activeElement = document.activeElement as HTMLElement;
      setLastFocusedElement(activeElement);

      styledElements.push(activeElement);

      activeElement.style.outline = "2px #00d0ff dashed";
      activeElement.style.outlineOffset = "-1px";

      if (window.scrollY != lastScrollYPos && !firstFocus) {
        lastScrollYPos = window.scrollY;

        if (scrollFeedback && !mute)
          await playSound({
            bias: spatializeScrollFeedback ? { x: getBias(lastFocusedElement!).x, y: -1 } : { x: 0, y: 0 },
            scrollBeep: true,
          });
      }

      if (!mute) playSound({ bias: getBias(activeElement), text: getReadout(activeElement) });
    },
    true
  );

  document.addEventListener(
    "focusout",
    () => {
      styledElements.forEach((el) => {
        if (el != document.activeElement) {
          el.style.outline = "";
          el.removeAttribute("outlineOffset");
        }
      });

      styledElements.splice(0, styledElements.length);
    },
    true
  );
};

async function getScrollSoundSettings(): Promise<Pick<Settings, "mute"> & ScrollSettings> {
  const items = await chrome.storage.sync.get(["scrollFeedback", "spatializeScrollFeedback", "mute"]);
  const { scrollFeedback, spatializeScrollFeedback, mute } = items as Partial<Settings>;

  return {
    scrollFeedback: scrollFeedback ?? false,
    spatializeScrollFeedback: spatializeScrollFeedback ?? false,
    mute: mute ?? false,
  };
}

let allElementsHighlighted = false;
function highlightChildren(element: HTMLElement, clear: boolean) {
  if (clear) {
    element.style.outline = "";
    element.removeAttribute("outlineOffset");
  } else {
    element.style.outline = "2px #00d0ff dashed";
    element.style.outlineOffset = "-1px";
  }

  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i] as HTMLElement;
    highlightChildren(child, clear);
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "popupEvent") {
    switch (message.data) {
      case "outline-elements":
        if (!allElementsHighlighted) {
          highlightChildren(document.documentElement, false);
          allElementsHighlighted = true;
        }
        break;
      case "clear-outlines":
        if (allElementsHighlighted) {
          highlightChildren(document.documentElement, true);
          allElementsHighlighted = false;
        }
        break;

      default:
        console.warn("Unknown message received:", message);
        break;
    }
  }
});

initialize();
