const fs = require('fs');
const ImageTracer = require('imagetracerjs');

const inputPath = 'public/logo-v2.png';
const outputPath = 'src/assets/logo-redwolf-v3.svg';

console.log('Tracing with ImageTracer...');

// Option preset: 'posterized1' or 'default' might be good, but we want high quality
const options = {
    // Number of colors
    colorquantcycles: 3,
    numberofcolors: 4, // we need at least red, black/dark, maybe white
    
    // SVG options
    viewbox: true,
    
    // Blur and preprocessing
    blurradius: 0,
    blurdelta: 20
};

ImageTracer.imageToSVG(
    inputPath,
    function(svgstr) {
        // Simple hack to remove white background shapes:
        // We can replace any fill="rgb(255,255,255)" or similar with fill="none"
        // Also remove very light colors which are probably anti-aliased background
        let noBgSvg = svgstr.replace(/fill="rgb\(25[0-5], ?25[0-5], ?25[0-5]\)"/g, 'fill="none"');
        noBgSvg = noBgSvg.replace(/fill="rgb\(24[0-9], ?24[0-9], ?24[0-9]\)"/g, 'fill="none"');
        
        fs.writeFileSync(outputPath, noBgSvg);
        console.log('Successfully generated multi-color SVG:', outputPath);
    },
    options
);
