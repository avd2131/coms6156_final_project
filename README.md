# spatial-interactions-extension

This project builds a web extension to enable an in-house screen reader experience with spatial interactions such as directional arrow-key navigation and spatial audio outputs.

# Architecture Overview

1. "Scan" the page (current in-view screen) -- open questions about best way to do this. Should we just crawl the DOM? How do you control when you hit the end of the page (we don't want to scroll in this case)? Should we use some sort of AI/CV/OCR? How do you correlate elements to their DOM info in this case?

2. Send elements info up to some TTS service to get audio (add associations of our own for what should be read out when we have headings vs. images vs. text vs. links etc.)

3. Spatialize corresponding audio.

4. If user scrolls the page we will need to repeat this pre-processing. 

To Test: On-demand spatialization. 

