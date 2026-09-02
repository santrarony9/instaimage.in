const fs = require('fs');
let file = fs.readFileSync('d:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx', 'utf8');

// Replace everything between {/* Signup Hook Banner */} and {/* Premium Category Tiles */} with the Marquee text
const sSignup = '{/* Signup Hook Banner */}';
const sTiles = '{/* Premium Category Tiles */}';
const iSignup = file.indexOf(sSignup);
const iTiles = file.indexOf(sTiles);

if (iSignup !== -1 && iTiles !== -1) {
    const marquee = fs.readFileSync('d:/anti gravity/InstaImage_Source_Code (1)/marquee.txt', 'utf8');
    file = file.substring(0, iSignup) + marquee + '\n      ' + file.substring(iTiles);
    fs.writeFileSync('d:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx', file, 'utf8');
    console.log("Success");
} else {
    console.log("Failed to find boundaries");
}
