import { getReadout } from './textContent';

/** Gets the horizontal/vertical bias of an onscreen element. Returns x/y biases bounded by -1 & 1. (0 signifies center of screen) */
export function getBias(element: HTMLElement, roundToTenth = true): { x: number; y: number } {
	const midpoint = getElementMidpoint(element);

	//console.log('width:', window.innerWidth, 'height:', window.innerHeight, 'midpoint:', midpoint, 'scroll pos:', window.scrollY);

	const bias = { x: midpoint.x / window.innerWidth, y: midpoint.y / window.innerHeight };

	let xBias = -1 + 2 * bias.x;
	let yBias = Math.min(Math.max(1 - 2 * bias.y, -1), 1); // Clamps yBias between -1 and 1. If the element is off screen in any vertical direction, its bias will be limited to -1 or 1.

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

export function worthNavigatingTo(startingElement: HTMLElement, destinationElement: HTMLElement, dir: string, alt = false): boolean | HTMLElement {
	if (!startingElement || !destinationElement) return false;

	if (startingElement === destinationElement || elementsRelated(startingElement, destinationElement)) return false;

	// Searches children/parent for valid alternative if element is not suitable for reading. Can result in unintuitive navigation, but solves the problem of missing many elements at a time.
	if (getReadout(destinationElement) === '') {
		if (alt) {
			if (destinationElement.parentElement) if (worthNavigatingTo(startingElement, destinationElement.parentElement, dir)) return destinationElement.parentElement as HTMLElement;

			for (var i = 0; i < destinationElement.children.length; i++) {
				const child = destinationElement.children[i];
				if (worthNavigatingTo(startingElement, child as HTMLElement, dir)) {
					console.log(getReadout(child as HTMLElement));
					return child as HTMLElement;
				}
			}
		} else return false;
	}

	const startElRect = startingElement.getBoundingClientRect();
	const destElRect = destinationElement.getBoundingClientRect();

	switch (dir) {
		case 'up':
			if (startElRect.top <= destElRect.top) return false; // If the top border of the destination element is lower/equal to than the current element's top border, don't mark this the destination element as worth navigating to. Same logic extends to the other three cases.
			break;
		case 'down':
			if (startElRect.bottom >= destElRect.bottom) return false;
			break;
		case 'left':
			if (startElRect.left <= destElRect.left) return false;
			break;
		case 'right':
			if (startElRect.right >= destElRect.right) return false;
			break;
	}

	return true;
}

/** Gets element in a certain direction (up, down, left, right)
 * - Element is only detected if readable by `getReadout()` in textContent.ts
 */
export function getElementInDirection(startingElement: HTMLElement | undefined, dir: string): HTMLElement | undefined {
	let nextEl: HTMLElement | undefined;

	if (!startingElement) return undefined;

	nextEl = startingElement;

	const rect = startingElement.getBoundingClientRect();

	switch (dir) {
		case 'left':
			nextEl = getElementInRegion(startingElement, dir, -1, rect.left, rect.top, rect.bottom);
			break;
		case 'up':
			// y-coordinate is reversed in web
			nextEl = getElementInRegion(startingElement, dir, rect.left, rect.right, -1, rect.top);
			break;
		case 'right':
			nextEl = getElementInRegion(startingElement, dir, rect.right, -1, rect.top, rect.bottom);
			break;
		case 'down':
			// y-coordinate is reversed in web
			nextEl = getElementInRegion(startingElement, dir, rect.left, rect.right, rect.bottom, -1);

			// if (nextEl && getTopBar(nextEl)) return undefined;
			break;
	}

	console.log(`Chosen element in ${dir} direction:`, nextEl, '; starting element:', startingElement);

	nextEl?.setAttribute('tabindex', '-1');
	return nextEl;
}

/** Determines if two elements are related to each other (returns true if `firstElement` is a parent/child of `secondElement`) */
function elementsRelated(firstElement: HTMLElement, secondElement: HTMLElement) {
	return firstElement.contains(secondElement) || secondElement.contains(firstElement);
}

const detailedLogging = true; // Turn off for better performance
// Increase interval for lower precision, but higher performance
function getElementInRegion(startingElement: HTMLElement, dir: string, minX: number, maxX: number, topY: number, bottomY: number, interval = 15): HTMLElement | undefined {
	if (minX === -1) minX = 0;
	if (maxX === -1) maxX = window.innerWidth;
	if (topY === -1) topY = 0;
	if (bottomY === -1) bottomY = window.innerHeight;

	if (detailedLogging) console.log(`%cRegion bounds - x: ${minX}-${maxX}; y: ${topY}-${bottomY}`, 'color: skyblue');

	/*
	 * Iterating y-value based on direction
	 * - Up: bottom-up (highest to lowest y-value)
	 * - Down: top-down (lowest to highest y-value)
	 * - Left: top-down (lowest to highest y-value)
	 * - Right: top-down (lowest to highest y-value)
	 */

	switch (dir) {
		case 'left':
			if (detailedLogging) console.log(`%cWe be navigating left`, 'color: skyblue');

			for (let x = maxX; x >= minX; x -= interval) {
				for (let y = topY; y <= bottomY; y += interval) {
					let elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;

					if (detailedLogging) console.log(`%cSearching for element at (${x}, ${y})`, 'color: yellow');

					let p;
					if ((p = worthNavigatingTo(startingElement, elementAtPoint, dir, true))) {
						if (typeof p !== 'boolean') {
							elementAtPoint = p;
						}

						if (getReadout(elementAtPoint) !== '') {
							if (detailedLogging) console.log('Element found: ', elementAtPoint);
							return elementAtPoint;
						}
					}
				}
			}
			break;
		case 'right':
			if (detailedLogging) console.log(`%cWe be navigating right`, 'color: skyblue');

			for (let x = minX; x <= maxX; x += interval) {
				for (let y = topY; y <= bottomY; y += interval) {
					let elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;

					if (detailedLogging) console.log(`%cSearching for element at (${x}, ${y})`, 'color: yellow');

					let p;
					if ((p = worthNavigatingTo(startingElement, elementAtPoint, dir, true))) {
						if (typeof p !== 'boolean') {
							elementAtPoint = p;
						}

						if (getReadout(elementAtPoint) !== '') {
							if (detailedLogging) console.log('Element found: ', elementAtPoint);
							return elementAtPoint;
						}
					}
				}
			}
			break;
		case 'up':
			if (detailedLogging) console.log('%cWe be navigating up', 'color: skyblue');

			for (let y = bottomY; y >= topY; y -= interval) {
				for (let x = minX; x <= maxX; x += interval) {
					let elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;

					if (detailedLogging) console.log(`%cSearching for element at (${x}, ${y})`, 'color: yellow');

					let p;
					if ((p = worthNavigatingTo(startingElement, elementAtPoint, dir, true))) {
						if (typeof p !== 'boolean') {
							elementAtPoint = p;
						}

						if (getReadout(elementAtPoint) !== '') {
							if (detailedLogging) console.log('Element found: ', elementAtPoint);
							return elementAtPoint;
						}
					}
				}
			}
			break;
		case 'down':
			if (detailedLogging) console.log('%cWe be navigating down', 'color: skyblue');

			for (let y = topY; y <= bottomY; y += interval) {
				for (let x = minX; x <= maxX; x += interval) {
					let elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;

					if (detailedLogging) console.log(`%cSearching for element at (${x}, ${y})`, 'color: yellow');

					let p;
					if ((p = worthNavigatingTo(startingElement, elementAtPoint, dir, true))) {
						if (typeof p !== 'boolean') {
							elementAtPoint = p;
						}

						if (getReadout(elementAtPoint) !== '') {
							if (detailedLogging) console.log('Element found: ', elementAtPoint);
							return elementAtPoint;
						}
					}
				}
			}
			break;
	}

	return undefined;
}

const textTypes = ['p', 'b', 'span', 'strong', 'em', 'q', 's', 'sub', 'sup', 'u'];
export function hasNonTextChildren(element: HTMLElement): boolean {
	for (let i = 0; i < element.children.length; i++) {
		const childElementType = element.children[i].tagName.toLowerCase();

		if (!textTypes.includes(childElementType)) return true;
	}

	return false;
}

/// Returns the 'top bar' that is the parent of the given element. Only does this if the given element is a child of the top bar (or the top bar container itself)
export function getTopBar(element: HTMLElement): HTMLElement | undefined {
	console.log('Top bar testing; ORIGINAL ELEMENT:', element);

	while (element.parentElement && element.parentElement !== document.documentElement) {
		console.log('Testing element: ', element, element.style);

		const computedStyle = getComputedStyle(element);

		if (computedStyle.position === 'sticky' || computedStyle.position === 'fixed') {
			console.log(element, 'sticky as hell');
			return element;
		}

		element = element.parentElement;
	}

	return undefined;
}
