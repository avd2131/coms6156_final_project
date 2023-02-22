export let verticalScrollStatus = 'top';

// Detects if at the top/bottom of screen when scrolling
document.addEventListener('scroll', (e) => {
	if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
		// At bottom of page
		verticalScrollStatus = 'bottom';
	} else verticalScrollStatus = 'neither';

	if (window.scrollY === 0) verticalScrollStatus = 'top';

	// console.log('Scrolled. Scroll status:', verticalScrollStatus);
});
