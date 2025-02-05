# WebNExt -- Spatial Interactions Chrome Extension

This code corresponds to a research project from the CEAL Lab, titled "It Brought Me Joy": Opportunities for Spatial Browsing in Desktop Screen Readers.

The full citation for the paper is:

Arnavi Chheda-Kothary, Ather Sharif, David A. Rios, and Brian A. Smith. 2025. “It Brought Me Joy”: Opportunities for Spatial Browsing in Desktop Screen Readers. In CHI Conference on Human Factors in Computing Systems (CHI ’25), April 26-May 1, 2025, Yokohama, Japan. ACM, New York, NY, USA, 18 pages. https://doi.org/10.1145/3706598.3714125 (edited)

This project builds a web extension to enable an in-house screen reader experience with spatial interactions such as directional arrow-key navigation and spatial audio outputs.

Project page: https://ceal.cs.columbia.edu/spatialinteractions/

# Architecture Overview

1. "Scan" the page (current in-view screen) -- open questions about best way to do this. Should we just crawl the DOM? How do you control when you hit the end of the page (we don't want to scroll in this case)? Should we use some sort of AI/CV/OCR? How do you correlate elements to their DOM info in this case?

2. Send elements info up to some TTS service to get audio (add associations of our own for what should be read out when we have headings vs. images vs. text vs. links etc.)

3. Spatialize corresponding audio.

4. If user scrolls the page we will need to repeat this pre-processing.

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
