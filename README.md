# WebNExt -- Spatial Interactions Chrome Extension

This code corresponds to a research project from the CEAL Lab, titled "It Brought Me Joy": Opportunities for Spatial Browsing in Desktop Screen Readers.

The full citation for the paper is:

Arnavi Chheda-Kothary, Ather Sharif, David A. Rios, and Brian A. Smith. 2025. “It Brought Me Joy”: Opportunities for Spatial Browsing in Desktop Screen Readers. In CHI Conference on Human Factors in Computing Systems (CHI ’25), April 26-May 1, 2025, Yokohama, Japan. ACM, New York, NY, USA, 18 pages. https://doi.org/10.1145/3706598.3714125 (edited)

This project builds a web extension to enable an in-house screen reader experience with spatial interactions such as directional arrow-key navigation and spatial audio outputs.

Project page: https://ceal.cs.columbia.edu/spatialinteractions/

# Architecture Overview
The user must first tab into the page, since the browser doesn't allow a script-triggered change in focus until a user carries out an action.

1. An element is selected through arrow key navigation ([navigation.ts](https://github.com/ColumbiaCEAL/spatial-interactions-extension/blob/main/src/navigation.ts)). Navigating directionally with arrow keys triggers [a loop](https://github.com/ColumbiaCEAL/spatial-interactions-extension/blob/092e257233ddba7d2cd7c908d8592b37b702e69a/src/utils/element.utils.ts#L318) that moves 15px in the given direction and checks for an element at that point using `document.elementFromPoint`.

2. Once an element is found, we [get its name and relevant content](https://github.com/ColumbiaCEAL/spatial-interactions-extension/blob/092e257233ddba7d2cd7c908d8592b37b702e69a/src/textContent.ts#L9) and process it in `mespeak.js` to get its speech audio.

3. Spatialize & play corresponding audio using the Web Audio API.

## Build Instructions

From this directory,
1. `npm install`

2. `npm run build` (one-time build) or `npm run watch` (hot reload)

## Running locally
1. Build extension with build instructions
2. Navigate to `chrome://extensions`
    -  _note: Enable developer mode (toggle located on top-right of page) if not already enabled_
3. Click 'Load unpacked' button
4. Find and select the `dist/` folder located in the project root folder

**Prerequisites**

- Node v18 LTS or greater
- npm

**Usage**

Extension can be toggled on/off with the `Ctrl`/`Cmd` + `Shift` + `,` keyboard shortcut.
