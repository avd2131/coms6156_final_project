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

const baseBuffer = 5;
let buffer = baseBuffer; //px
export function getElementStartingPoints(element: HTMLElement, dir: string) {
	if (!element) {
		console.error("Provided element doesn't exist.");
		return undefined;
	}

	const rect = element.getBoundingClientRect();

	buffer = baseBuffer + rect.height / 100;

	switch (dir) {
		case 'left':
			return [
				{ x: rect.left, y: rect.bottom - buffer },
				{ x: rect.left, y: rect.bottom - rect.height / 2 },
				{ x: rect.left, y: rect.top + buffer }
			];
		case 'right':
			return [
				{ x: rect.right, y: rect.bottom - buffer },
				{ x: rect.right, y: rect.bottom - rect.height / 2 },
				{ x: rect.right, y: rect.top + buffer }
			];
		case 'up':
			return [
				{ x: rect.left + buffer, y: rect.top },
				{ x: rect.left + rect.width / 2, y: rect.top },
				{ x: rect.right - buffer, y: rect.top }
			];
		case 'down':
			return [
				{ x: rect.left + buffer, y: rect.bottom },
				{ x: rect.left + rect.width / 2, y: rect.bottom },
				{ x: rect.right - buffer, y: rect.bottom }
			];
		default:
			console.error('Unknown direction:', dir);
			return undefined;
	}
}

const acceptableEdgeDistance = 20;
export function worthNavigatingTo(startingElement: HTMLElement, destinationElement: HTMLElement, dir: string): boolean {
	if (startingElement === destinationElement || getReadout(destinationElement) === '' || elementsRelated(startingElement, destinationElement)) return false;

	const startElRect = startingElement.getBoundingClientRect();
	const destElRect = destinationElement.getBoundingClientRect();

	switch (dir) {
		case 'up':
			if (Math.abs(startElRect.top - destElRect.top) < acceptableEdgeDistance) return false;
			break;
		case 'down':
			if (Math.abs(startElRect.bottom - destElRect.bottom) < acceptableEdgeDistance) return false;
			break;
		case 'left':
			if (Math.abs(startElRect.left - destElRect.left) < acceptableEdgeDistance) return false;
			break;
		case 'right':
			if (Math.abs(startElRect.right - destElRect.right) < acceptableEdgeDistance) return false;
			break;
	}

	return true;
}

function elementsFromPoints(points: { x: number; y: number }[]) {
	const elements: HTMLElement[] = [];

	points.forEach((point, i) => {
		const elementAtPoint = document.elementFromPoint(point.x, point.y) as HTMLElement;

		// console.log(`Point ${i}:`, points[i], '; element:', elementAtPoint);

		if (elementAtPoint) elements.push(elementAtPoint);
	});

	// Remove duplicates
	return elements.filter((el, i) => elements.indexOf(el) === i);
}

/** Gets element in a certain direction (up, down, left, right)
 * - Element is only detected if readable by `getReadout()` in textContent.ts
 */
export function getElementInDirection(startingElement: HTMLElement | undefined, dir: string, maxAttempts: number): HTMLElement | undefined {
	let nextEl: HTMLElement | undefined;
	let attempts = 0;

	if (!startingElement) return undefined;

	let startingPoints = getElementStartingPoints(startingElement, dir)!;

	nextEl = startingElement;
	let validElements: HTMLElement[] = [];

	while (validElements.length === 0) {
		validElements = elementsFromPoints(startingPoints).filter((el) => worthNavigatingTo(startingElement, el, dir));

		switch (dir) {
			case 'left':
				startingPoints.forEach((pt) => {
					pt.x -= 10;
				});
				break;
			case 'up':
				// y-coordinate is reversed in web
				startingPoints.forEach((pt) => {
					pt.y -= 10;
				});
				break;
			case 'right':
				startingPoints.forEach((pt) => {
					pt.x += 10;
				});
				break;
			case 'down':
				// y-coordinate is reversed in web
				startingPoints.forEach((pt) => {
					pt.y += 10;
				});
				break;
		}

		if (attempts++ > maxAttempts) return undefined;
	}

	// Sort valid elements depending on proximity to certain extremities
	// e.g. if searching left/right, the topmost element should be ordered first. If searching up/down, the leftmost element should be ordered first
	if (dir === 'left' || dir === 'right')
		validElements.sort((a, b) => {
			return getElementMidpoint(a).y - getElementMidpoint(b).y;
		});
	else if (dir === 'up' || dir === 'down')
		validElements.sort((a, b) => {
			return getElementMidpoint(a).x - getElementMidpoint(b).x;
		});

	nextEl = validElements[0];

	console.log('Valid elements:', validElements, 'Chosen element:', nextEl);

	nextEl?.setAttribute('tabindex', '-1');
	return nextEl;
}

/** Determines if two elements are related to each other (returns true if `firstElement` is a parent/child of `secondElement`) */
function elementsRelated(firstElement: HTMLElement, secondElement: HTMLElement) {
	return firstElement.contains(secondElement) || secondElement.contains(firstElement);
}
