const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/components/layout/navbar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/href="\/booking"/g, 'href="/#shop"');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Navbar Links');
