const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../src/assets/logo-redwolf-v2.svg');
let svgContent = fs.readFileSync(svgPath, 'utf8');

// Define the gradient
const defs = `
<defs>
  <linearGradient id="left-red-right-white" x1="0" y1="0" x2="1408" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="50%" stop-color="#B11C24" />
    <stop offset="50%" stop-color="#FFFFFF" />
  </linearGradient>
</defs>
`;

// Insert defs right after <svg ...>
svgContent = svgContent.replace(/(<svg[^>]*>)/, '$1\n' + defs);

// Process paths
const pathRegex = /<path([^>]+)fill="([^"]+)"([^>]*)>/g;

let newSvg = svgContent.replace(pathRegex, (match, before, fill, after) => {
  // Check if fill is white-ish
  const fillUpper = fill.toUpperCase();
  const isWhiteIsh = fillUpper.startsWith('#F') || fillUpper === '#FFFFFF' || fillUpper.startsWith('#E');
  
  if (isWhiteIsh) {
    // Remove the path
    return '';
  } else {
    // Keep it, but change fill to our gradient
    return `<path${before}fill="url(#left-red-right-white)"${after}>`;
  }
});

fs.writeFileSync(svgPath, newSvg);
console.log('Processed SVG successfully.');
