const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../src/assets/logo-redwolf-v2.svg');
let svgContent = fs.readFileSync(svgPath, 'utf8');

// The original file is a mess now, let's just parse the paths out of it.
const pathRegex = /<path[^>]+transform="([^"]+)"[^>]*>/g;

let paths = [];
let match;
while ((match = pathRegex.exec(svgContent)) !== null) {
  // We extract the whole match, but we need to remove the fill attribute
  let pathStr = match[0];
  pathStr = pathStr.replace(/\s*fill="[^"]+"/, '');
  paths.push(pathStr);
}

const newSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1408 768" width="100%" height="100%">
<defs>
  <clipPath id="left-half">
    <rect x="0" y="0" width="704" height="768" />
  </clipPath>
  <clipPath id="right-half">
    <rect x="704" y="0" width="704" height="768" />
  </clipPath>
  <g id="wolf-face">
    ${paths.join('\n    ')}
  </g>
</defs>

<use href="#wolf-face" fill="#B11C24" clip-path="url(#left-half)" />
<use href="#wolf-face" fill="#FFFFFF" clip-path="url(#right-half)" />

</svg>
`;

fs.writeFileSync(svgPath, newSvg);
console.log('Processed SVG with clipPath successfully.');
