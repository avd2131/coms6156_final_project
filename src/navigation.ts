import { playSound } from './audioPlayer';
import { getBias, getElementInDirection } from './elementUtils';
import { verticalScrollStatus } from './scroll';
import { getReadout } from './textContent';

let lastFocusedElement: HTMLElement | undefined;
const maxNavAttempts = screen.height / 10;

export function setLastFocusedElement(element: HTMLElement) {
	lastFocusedElement = element;
}

export function initializeNavigationListeners() {
	console.log('Navigation initialized');

	document.addEventListener('keydown', async (e) => {
		// console.log(e); (Logs keyboard events)

		let nextEl: HTMLElement | undefined;

		if (!lastFocusedElement) return;

		switch (e.key.toLowerCase()) {
			case 'w': // Move up
				nextEl = getElementInDirection(lastFocusedElement, 'up', maxNavAttempts);

				if (nextEl) {
					// Element found
					nextEl.focus();
				} else {
					// No element found
					if (verticalScrollStatus !== 'top' && verticalScrollStatus !== 'noscroll') {
						// Scroll up and try looking for elements again
						window.scrollBy(0, -50);

						document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
					}
				}
				break;
			case 'a': // Move left
				nextEl = getElementInDirection(lastFocusedElement, 'left', maxNavAttempts);

				if (nextEl) {
					// Element found
					nextEl.focus();
				}
				break;
			case 's': // Move down
				nextEl = getElementInDirection(lastFocusedElement, 'down', maxNavAttempts);

				if (nextEl) {
					// Element found
					nextEl.focus();
				} else {
					// No element found
					if (verticalScrollStatus !== 'bottom' && verticalScrollStatus !== 'noscroll') {
						// Scroll down and try looking for elements again
						window.scrollBy(0, 50);

						document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
					}
				}
				break;
			case 'd': // Move right
				nextEl = getElementInDirection(lastFocusedElement, 'right', maxNavAttempts);

				if (nextEl) {
					// Element found
					nextEl.focus();
				}
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
}
