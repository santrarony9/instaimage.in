const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/booking/Step7Payment.tsx', 'utf8');
content = content.replace(
  'if (msg === "Failed to fetch")',
  'if (msg === "Failed to fetch" || msg === "Load failed" || msg === "NetworkError when attempting to fetch resource.")'
);
fs.writeFileSync('frontend/src/components/booking/Step7Payment.tsx', content, 'utf8');
