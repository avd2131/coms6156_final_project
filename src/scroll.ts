import { onEventListenerStatusChange } from "./utils/eventHandling.utils";

export let verticalScrollStatus = "top";

function updateScrollStatus() {
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
    // At bottom of page
    verticalScrollStatus = "bottom";
  } else verticalScrollStatus = "neither";

  if (window.scrollY === 0) verticalScrollStatus = "top";

  if (window.innerHeight === document.body.scrollHeight) verticalScrollStatus = "noscroll";
}

// Detects if at the top/bottom of screen when scrolling
const initializeScrollListeners = () => {
  document.addEventListener("scroll", updateScrollStatus);
  window.addEventListener("resize", updateScrollStatus);
};

const clearScrollListeners = () => {
  document.removeEventListener("scroll", updateScrollStatus);
  window.removeEventListener("resize", updateScrollStatus);
};

updateScrollStatus();
onEventListenerStatusChange({ onEnable: initializeScrollListeners, onDisable: clearScrollListeners });
