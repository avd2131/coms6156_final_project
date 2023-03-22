import { playSound } from './audioPlayer';
import { getBias } from './elementUtils';
import { initializeNavigationListeners, lastFocusedElement, setLastFocusedElement } from './navigation';
import { getReadout } from './textContent';

console.log('%cSpatial Interactions Extension: Content script loaded!', 'color: green; font-style: bold');

// Listens for any events sent from either popup.tsx or background.ts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.color) {
		console.log('Receive color = ' + msg.color);
		document.body.style.backgroundColor = msg.color;
		sendResponse('Change color to ' + msg.color);
	} else {
		sendResponse('Color message is none.');
	}
});

// Set up 'WASD' navigation
initializeNavigationListeners();

// Detects which element is currently being focused on and gives it a border
let lastScrollYPos = window.scrollY;
let styledElements: HTMLElement[] = [];
document.addEventListener(
	'focusin',
	async () => {
		const { scrollFeedback, spatializeFeedback, mute } = await getScrollSoundSettings();

		if (window.scrollY != lastScrollYPos) {
			if (scrollFeedback && !mute) await playSound(spatializeFeedback ? { x: getBias(lastFocusedElement!).x, y: -1 } : { x: 0, y: 0 }, '_scroll-indicator_');
		}

		const activeElement = document.activeElement as HTMLElement;
		setLastFocusedElement(activeElement);

		if (!mute) playSound(getBias(activeElement), getReadout(activeElement));

		styledElements.push(activeElement);

		activeElement.style.outline = '2px #00d0ff dashed';
		activeElement.style.outlineOffset = '-1px';

		lastScrollYPos = window.scrollY;
	},
	true
);

document.addEventListener(
	'focusout',
	() => {
		styledElements.forEach((el) => {
			if (el != document.activeElement) {
				el.style.outline = '';
				el.removeAttribute('outlineOffset');
			}
		});

		styledElements.splice(0, styledElements.length);
	},
	true
);

function getScrollSoundSettings(): Promise<{ scrollFeedback: boolean; spatializeFeedback: boolean; mute: boolean }> {
	return new Promise((resolve) => {
		chrome.storage.sync.get(['scrollFeedback', 'spatializeFeedback', 'mute'], (items) => {
			resolve((items as { scrollFeedback: boolean; spatializeFeedback: boolean; mute: boolean }) ?? { scrollFeedback: false, spatializeFeedback: false, mute: false });
		});
	});
}
