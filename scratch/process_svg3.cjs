const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../src/assets/logo-redwolf-v2.svg');
let svgContent = fs.readFileSync(svgPath, 'utf8');

// The original file has our <g id="wolf-face"> inside it.
// We can just regex out the <path ... /> elements again if needed, or if the file already has <g id="wolf-face">, we can extract the inner contents.
const pathRegex = /<path[^>]+transform="([^"]+)"[^>]*>/g;

let paths = [];
let match;
while ((match = pathRegex.exec(svgContent)) !== null) {
  let pathStr = match[0];
  // ensure no fill
  pathStr = pathStr.replace(/\s*fill="[^"]+"/, '');
  paths.push(pathStr);
}

const newSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1408 768" width="100%" height="100%">
<defs>
  <!-- Smooth gradient from White (left) to Red (right) -->
  <!-- We use 40% and 60% for a smooth but noticeable blend in the center -->
  <linearGradient id="smooth-fade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="45%" stop-color="#FFFFFF" />
    <stop offset="55%" stop-color="#B11C24" />
  </linearGradient>

  <!-- Group containing all the wolf lines -->
  <g id="wolf-face">
    ${paths.join('\n    ')}
  </g>

  <!-- Mask that uses the wolf lines (colored solid white so they are opaque in the mask) -->
  <mask id="wolf-mask">
    <!-- Fill with white so the mask is 100% visible where the paths are -->
    <use href="#wolf-face" fill="#FFFFFF" />
  </mask>
</defs>

<!-- A single large rectangle covering the whole viewBox, filled with our smooth gradient, and masked by the wolf face -->
<rect x="0" y="0" width="1408" height="768" fill="url(#smooth-fade)" mask="url(#wolf-mask)" />

</svg>
`;

fs.writeFileSync(svgPath, newSvg);
console.log('Processed SVG with mask and smooth gradient successfully.');
