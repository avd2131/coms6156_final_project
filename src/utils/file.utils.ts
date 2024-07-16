/// Assumes the file the URL points to is 'packed' into the assets folder
export async function getArrayBuffer(url: string) {
  const filename = url.split("/").pop();

  // Gets the path to the file given its root path (special for Chrome extensions)
  const storedFileURL = chrome.runtime.getURL(`assets/${filename}`);

  let response = await fetch(storedFileURL);
  const dataBlob = await response.blob();

  return await dataBlob.arrayBuffer();
}
