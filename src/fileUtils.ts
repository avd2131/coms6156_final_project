export async function getFile(url: string, name: string) {
	let response = await fetch(url);
	let data = await response.blob();

	let metadata = {
		type: 'image/mp3'
	};

	let file = new File([data], name + '.mp3', metadata);

	return file;
}

/// Assumes the file the URL points to is 'packed' into the assets folder
export async function getArrayBuffer(url: string) {
	const filename = url.split('/').pop();

	// Gets the path to the file given its root path (special for Chrome extensions)
	const storedFileURL = chrome.runtime.getURL(`assets/${filename}`);

	console.log('stored file URL:', storedFileURL);

	let response = await fetch(storedFileURL);
	const dataBlob = await response.blob();

	return await dataBlob.arrayBuffer();
}
