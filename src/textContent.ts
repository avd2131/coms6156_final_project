/**
 * Returns the text the voiceover should read out
 */
export function getReadout(element: HTMLElement): string {
	// Should the TTS read out the element name first or the element contents first?
	let elementFirst = true;
	let elementName = '';
	let elementContent = undefined; // if element content is undefined, default to textContent. It will be undefined when it comes to elements like p, a, etc, but not so for img; this will be set to alt text, for example.

	console.log(element.nodeName.toLowerCase());
	switch (element.nodeName.toLowerCase()) {
		case 'a':
			elementName = 'link';
			break;
		case 'p':
			elementName = 'text';
			break;
		case 'img':
			elementName = 'img';
			elementContent = element.getAttribute('alt') ?? '';

			console.log(elementContent);
			break;
		default:
			console.log('unknown element type:', element.nodeName.toLowerCase(), 'element:', element);
			// If dealing with element not listed, return empty string (ignore it)
			return '';
	}

	if (!elementContent) elementContent = element.textContent;

	// Comma makes the voiceover wait for a bit before continuing
	if (elementFirst) return elementName + ',' + elementContent;
	else return elementContent + ',';
}
