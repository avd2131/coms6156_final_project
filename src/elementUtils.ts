import { getReadout } from './textContent';

/** Gets the horizontal/vertical bias of an onscreen element. Returns x/y biases bounded by -1 & 1. (0 signifies center of screen) */
export function getBias(element: HTMLElement, roundToTenth = true): { x: number; y: number } {
	const midpoint = getElementMidpoint(element);

	//console.log('width:', window.innerWidth, 'height:', window.innerHeight, 'midpoint:', midpoint, 'scroll pos:', window.scrollY);

	const bias = { x: midpoint.x / window.innerWidth, y: midpoint.y / window.innerHeight };

	let xBias = -1 + 2 * bias.x;
	let yBias = 1 - 2 * bias.y;

	// If the element is not on screen, set the yBias to 0. This can easily be changed if we ever want to handle this edge case differently
	if (yBias > 1 || yBias < -1) yBias = 0;

	if (roundToTenth) {
		xBias = Math.round(xBias * 10) / 10;
		yBias = Math.round(yBias * 10) / 10;
	}

	return { x: xBias, y: yBias };
}

export function getElementMidpoint(element: HTMLElement) {
	const rect = element.getBoundingClientRect();

	// Get midpoint of element (https://javascript.info/coordinates)
	return { x: rect.left + rect.width / 2, y: rect.bottom - rect.height / 2 };
}

export function getElementStartingPoints(element: HTMLElement, dir: string) {
	const rect = element.getBoundingClientRect();

	switch (dir) {
		case 'left':
			return [{ x: rect.left, y: rect.bottom - rect.height / 2 }];
		case 'right':
			return [{ x: rect.right, y: rect.bottom - rect.height / 2 }];
		case 'up':
			return [{ x: rect.left + rect.width / 2, y: rect.top }];
		case 'down':
			return [{ x: rect.left + rect.width / 2, y: rect.bottom }];
	}
}

export function getDirectionalMidpoint(element: HTMLElement, dir: string): { x: number; y: number } | undefined {
	if (!element) return undefined;

	const rect = element.getBoundingClientRect();

	switch (dir) {
		case 'left':
			return { x: rect.left, y: rect.bottom - rect.height / 2 };
		case 'right':
			return { x: rect.right, y: rect.bottom - rect.height / 2 };
		case 'up':
			return { x: rect.left + rect.width / 2, y: rect.bottom };
		case 'down':
			return { x: rect.left + rect.width / 2, y: rect.top };
	}

	return undefined;
}

export function worthNavigatingTo(startingElement: HTMLElement, destinationElement: HTMLElement): boolean {
	if (startingElement === destinationElement || /*!elementRecognized(destinationElement)*/ getReadout(destinationElement) === '' || elementsRelated(startingElement, destinationElement)) return false;

	return true;
}

export function getElementInDirection(startingElement: HTMLElement | undefined, dir: string, maxAttempts: number): HTMLElement | undefined {
	let nextEl: HTMLElement | undefined;
	let attempts = 0;

	if (!startingElement) return undefined;

	// let startingPoint = getDirectionalMidpoint(startingElement, dir)!;
	let startingPoint = getElementStartingPoints(startingElement, dir)![0];

	nextEl = startingElement;
	let validElements: HTMLElement[] = [];
	while (validElements.length === 0) {
		validElements = (document.elementsFromPoint(startingPoint.x, startingPoint.y) as HTMLElement[]).filter((el) => worthNavigatingTo(startingElement, el));

		console.log('Valid elements: ', validElements);

		switch (dir) {
			case 'left':
				startingPoint.x -= 10;
				break;
			case 'up':
				// y-coordinate is reversed in web
				startingPoint.y -= 10;
				break;
			case 'right':
				startingPoint.x += 10;
				break;
			case 'down':
				// y-coordinate is reversed in web
				startingPoint.y += 10;
				break;
		}

		if (attempts++ > maxAttempts) return undefined;
	}

	nextEl = validElements[0];

	nextEl?.setAttribute('tabindex', '-1');
	return nextEl;
}

const recognizedElements: string[] = ['a', 'li', 'svg', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'div'];
function elementRecognized(element: HTMLElement): boolean {
	if (!element) return false;

	return recognizedElements.includes(element.tagName.toLowerCase());
}

function elementsRelated(firstElement: HTMLElement, secondElement: HTMLElement) {
	return firstElement.contains(secondElement) || secondElement.contains(firstElement);
}
