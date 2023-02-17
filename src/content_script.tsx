import { playSound } from './audioPlayer';
import { getBias, getElementInDirection, getElementMidpoint } from './elementUtils';
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

let lastFocusedElement: HTMLElement | undefined;
const maxNavAttempts = screen.height / 10;
document.addEventListener('keydown', async (e) => {
	// console.log(e); (Logs keyboard events)

	let nextEl: HTMLElement | undefined;

	switch (e.key.toLowerCase()) {
		case 'w': // Move up
			nextEl = getElementInDirection(lastFocusedElement, 'up', maxNavAttempts);

			if (nextEl) {
				nextEl.focus();

				console.log('Clicked up; element found:', nextEl);
			} else console.log('Clicked up; no element found.');
			break;
		case 'a': // Move left
			console.log('Clicking left...');

			nextEl = getElementInDirection(lastFocusedElement, 'left', maxNavAttempts);

			if (nextEl) {
				nextEl.focus();

				console.log('Clicked left; element found:', nextEl);
			} else console.log('Clicked left; no element found.');
			break;
		case 's': // Move right
			nextEl = getElementInDirection(lastFocusedElement, 'down', maxNavAttempts);

			if (nextEl) {
				nextEl.focus();

				console.log('Clicked down; element found:', nextEl);
			} else console.log('Clicked down; no element found.');
			break;
		case 'd': // Move down
			nextEl = getElementInDirection(lastFocusedElement, 'right', maxNavAttempts);

			if (nextEl) {
				nextEl.focus();

				console.log('Clicked right; element found:', nextEl);
			} else console.log('Clicked right; no element found.');
			break;
		case 'b':
			if (e.ctrlKey || e.metaKey) {
				// Test active element reading with Ctrl/Command + B.
				const focusedElement = document.activeElement as HTMLElement;
				await playSound(getBias(focusedElement), getReadout(focusedElement));
			}
			break;
	}
});

// Detects which element is currently being focused on and gives it a border
let lastBorder = '';
document.addEventListener(
	'focusin',
	() => {
		const activeElement = document.activeElement as HTMLElement;
		lastFocusedElement = activeElement;

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
