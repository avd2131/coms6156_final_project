import { playSound } from './audioPlayer';
import { getBias, getElementInDirection, getElementMidpoint } from './elementUtils';
import { initializeNavigationListeners, setLastFocusedElement } from './navigation';
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
let lastBorder = '';
document.addEventListener(
	'focusin',
	() => {
		const activeElement = document.activeElement as HTMLElement;
		setLastFocusedElement(activeElement);

		lastBorder = activeElement.style.border ?? '';
		activeElement.style.border = '2px solid #00d0ff';
	},
	true
);

document.addEventListener(
	'focusout',
	(e) => {
		const unfocusedElement = e.target as HTMLElement;
		unfocusedElement.style.border = lastBorder; // Preserves existing border if it had any
	},
	true
);
