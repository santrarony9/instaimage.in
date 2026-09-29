const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/booking/Step7Payment.tsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(107, 115).join('\n'));
