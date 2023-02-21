import { playSound } from './audioPlayer';
import { getBias, getElementInDirection } from './elementUtils';
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

					console.log('Clicked down; element found:', nextEl, '; equal:', nextEl === lastFocusedElement);
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
}
