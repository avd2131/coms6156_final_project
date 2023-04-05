import { getElementInDirection, getFirstScrollView, scrolledToBottom, scrolledToTop } from './elementUtils';
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

const scrollPauseInterval = 50;

let attemptingNavigation = false;
let keyPressDuringNavigation = false;
async function navigate(key: string, fromKeypress: boolean) {
	let nextEl: HTMLElement | undefined;

	if (!lastFocusedElement) return;

	if (!attemptingNavigation) keyPressDuringNavigation = false;
	if (attemptingNavigation && fromKeypress) keyPressDuringNavigation = true;

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
				const scrollView = getFirstScrollView(lastFocusedElement);

				if (scrollView && !scrolledToTop(scrollView) && !keyPressDuringNavigation) {
					console.log('scrolling up...');

					await sleep(scrollPauseInterval);

					scrollView.scrollBy(0, -300);

					navigate('w', false);
				} else if (verticalScrollStatus !== 'top' && verticalScrollStatus !== 'noscroll' && !keyPressDuringNavigation) {
					// Scroll up and try looking for elements again
					console.log('scrolling up...');

					await sleep(scrollPauseInterval);

					window.scrollBy(0, -300);

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
				console.log('focusing on element:', nextEl);

				// Element found
				nextEl.focus();

				attemptingNavigation = false;
			} else {
				// No element found
				const scrollView = getFirstScrollView(lastFocusedElement);
				if (scrollView && !scrolledToBottom(scrollView) && !keyPressDuringNavigation) {
					console.trace('scrolling down...');

					await sleep(scrollPauseInterval);

					scrollView.scrollBy(0, 300);

					navigate('s', false);
				} else if (verticalScrollStatus !== 'bottom' && verticalScrollStatus !== 'noscroll' && !keyPressDuringNavigation) {
					// Scroll down and try looking for elements again
					console.trace('scrolling down...');

					await sleep(scrollPauseInterval);

					window.scrollBy(0, 300);

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
