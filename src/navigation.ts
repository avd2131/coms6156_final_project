import { getElementInDirection } from './elementUtils';
import { verticalScrollStatus } from './scroll';

export let lastFocusedElement: HTMLElement | undefined;

export function setLastFocusedElement(element: HTMLElement) {
	lastFocusedElement = element;
}

export function initializeNavigationListeners() {
	document.addEventListener('keydown', async (e) => {
		navigate(e.key, true);
	});
}

let attemptingNavigation = false;
async function navigate(key: string, fromKeypress: boolean) {
	let nextEl: HTMLElement | undefined;

	if (!lastFocusedElement) return;

	console.log(attemptingNavigation, fromKeypress);

	if (attemptingNavigation && fromKeypress) return;

	switch (key.toLowerCase()) {
		case 'w': // Move up
			attemptingNavigation = true;

			nextEl = getElementInDirection(lastFocusedElement, 'up');

			if (nextEl) {
				// Element found
				nextEl.focus();

				attemptingNavigation = false;
			} else {
				// No element found

				if (verticalScrollStatus !== 'top' && verticalScrollStatus !== 'noscroll') {
					// Scroll up and try looking for elements again
					window.scrollBy(0, -50);

					await sleep(20);

					navigate('w', false);
				} else attemptingNavigation = false;
			}
			break;
		case 'a': // Move left
			attemptingNavigation = true;

			nextEl = getElementInDirection(lastFocusedElement, 'left');

			if (nextEl) {
				// Element found
				nextEl.focus();
			}

			attemptingNavigation = false;
			break;
		case 's': // Move down
			attemptingNavigation = true;

			nextEl = getElementInDirection(lastFocusedElement, 'down');

			if (nextEl) {
				// Element found
				nextEl.focus();

				attemptingNavigation = false;
			} else {
				// No element found
				if (verticalScrollStatus !== 'bottom' && verticalScrollStatus !== 'noscroll') {
					// Scroll down and try looking for elements again
					window.scrollBy(0, 50);

					await sleep(20);

					navigate('s', false);
				} else attemptingNavigation = false;
			}
			break;
		case 'd': // Move right
			attemptingNavigation = true;

			nextEl = getElementInDirection(lastFocusedElement, 'right');

			if (nextEl) {
				// Element found
				nextEl.focus();
			}

			attemptingNavigation = false;

			break;
	}
}

const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
