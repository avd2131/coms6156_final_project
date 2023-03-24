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
let firstFocus = true;
document.addEventListener(
	'focusin',
	async () => {
		const { scrollFeedback, spatializeFeedback, mute } = await getScrollSoundSettings();

		firstFocus = false;

		const activeElement = document.activeElement as HTMLElement;
		setLastFocusedElement(activeElement);

		styledElements.push(activeElement);

		activeElement.style.outline = '2px #00d0ff dashed';
		activeElement.style.outlineOffset = '-1px';

		if (window.scrollY != lastScrollYPos && !firstFocus) {
			lastScrollYPos = window.scrollY;

			if (scrollFeedback && !mute) await playSound(spatializeFeedback ? { x: getBias(lastFocusedElement!).x, y: -1 } : { x: 0, y: 0 }, '_scroll-indicator_');
		}

		if (!mute) playSound(getBias(activeElement), getReadout(activeElement));
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
			console.log(items);

			resolve((items as { scrollFeedback: boolean; spatializeFeedback: boolean; mute: boolean }) ?? { scrollFeedback: false, spatializeFeedback: false, mute: false });
		});
	});
}

let allElementsHighlighted = false;
function highlightChildren(element: HTMLElement, clear: boolean) {
	if (clear) {
		element.style.outline = '';
		element.removeAttribute('outlineOffset');
	} else {
		element.style.outline = '2px #00d0ff dashed';
		element.style.outlineOffset = '-1px';
	}

	for (let i = 0; i < element.children.length; i++) {
		const child = element.children[i] as HTMLElement;
		highlightChildren(child, clear);
	}
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log('We got a message', message);

	if (message.type === 'popupEvent') {
		switch (message.data) {
			case 'outline-elements':
				if (!allElementsHighlighted) {
					highlightChildren(document.documentElement, false);
					allElementsHighlighted = true;
				}
				break;
			case 'clear-outlines':
				if (allElementsHighlighted) {
					highlightChildren(document.documentElement, true);
					allElementsHighlighted = false;
				}
				break;

			default:
				console.warn('Unknown message received:', message);
				break;
		}
	}
});
