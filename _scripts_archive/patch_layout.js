const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/layout.tsx', 'utf8');
content = content.replace(
  'icons: {',
  'icons: {\n    icon: "/icon-192.png",'
);
fs.writeFileSync('frontend/src/app/layout.tsx', content, 'utf8');
