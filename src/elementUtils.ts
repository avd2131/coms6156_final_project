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

export function getElementInDirection(startingElement: HTMLElement | undefined, dir: string, maxAttempts: number): HTMLElement | undefined {
	let nextEl: HTMLElement | undefined;
	let attempts = 0;

	if (!startingElement) return undefined;

	let midpoint = getElementMidpoint(startingElement);

	console.log('original element:', startingElement);

	nextEl = startingElement;
	while (nextEl === startingElement || !elementRecognized(nextEl) || nextEl.contains(startingElement)) {
		nextEl = document.elementFromPoint(midpoint.x, midpoint.y) as HTMLElement;
		switch (dir) {
			case 'left':
				midpoint.x -= 10;
				break;
			case 'up':
				// y coordinate is reversed in web
				midpoint.y -= 10;
				break;
			case 'right':
				midpoint.x += 10;
				break;
			case 'down':
				// y coordinate is reversed in web
				midpoint.y += 10;
				break;
		}

		if (attempts++ > maxAttempts) break;
	}

	return nextEl;
}

const recognizedElements: string[] = ['a', 'li', 'svg', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'div'];
function elementRecognized(element: HTMLElement): boolean {
	if (!element) return false;

	return recognizedElements.includes(element.tagName.toLowerCase());
}
