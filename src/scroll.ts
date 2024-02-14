export let verticalScrollStatus = "top";

function updateScrollStatus() {
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
    // At bottom of page
    verticalScrollStatus = "bottom";
  } else verticalScrollStatus = "neither";

  if (window.scrollY === 0) verticalScrollStatus = "top";

  if (window.innerHeight === document.body.scrollHeight) verticalScrollStatus = "noscroll";
}

updateScrollStatus();

// Detects if at the top/bottom of screen when scrolling
document.addEventListener("scroll", (e) => {
  updateScrollStatus();
});

window.addEventListener("resize", () => {
  updateScrollStatus();
});
