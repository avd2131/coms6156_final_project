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
	if (!element) {
		console.error("Provided element doesn't exist.");
		return undefined;
	}

	const rect = element.getBoundingClientRect();

	switch (dir) {
		case 'left':
			return [
				{ x: rect.left, y: rect.bottom },
				{ x: rect.left, y: rect.bottom - rect.height / 2 },
				{ x: rect.left, y: rect.top }
			];
		case 'right':
			return [
				{ x: rect.right, y: rect.bottom },
				{ x: rect.right, y: rect.bottom - rect.height / 2 },
				{ x: rect.right, y: rect.top }
			];
		case 'up':
			return [
				{ x: rect.left, y: rect.top },
				{ x: rect.left + rect.width / 2, y: rect.top },
				{ x: rect.right, y: rect.top }
			];
		case 'down':
			return [
				{ x: rect.left, y: rect.bottom },
				{ x: rect.left + rect.width / 2, y: rect.bottom },
				{ x: rect.right, y: rect.bottom }
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

	points.forEach((point) => {
		const elementsAtPoint = document.elementsFromPoint(point.x, point.y) as HTMLElement[];

		elementsAtPoint.forEach((el) => {
			elements.push(el);
		});
	});

	return elements;
}

export function getElementInDirection(startingElement: HTMLElement | undefined, dir: string, maxAttempts: number): HTMLElement | undefined {
	let nextEl: HTMLElement | undefined;
	let attempts = 0;

	if (!startingElement) return undefined;

	let startingPoints = getElementStartingPoints(startingElement, dir)!;

	nextEl = startingElement;
	let validElements: HTMLElement[] = [];
	while (validElements.length === 0) {
		validElements = elementsFromPoints(startingPoints).filter((el) => worthNavigatingTo(startingElement, el, dir));

		console.log('Valid elements: ', validElements);

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

	nextEl = validElements[0];

	nextEl?.setAttribute('tabindex', '-1');
	return nextEl;
}

function elementsRelated(firstElement: HTMLElement, secondElement: HTMLElement) {
	return firstElement.contains(secondElement) || secondElement.contains(firstElement);
}
