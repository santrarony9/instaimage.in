const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/booking/Step7Payment.tsx', 'utf8');
content = content.replace(
  'setCalcError(error.message || "Unknown error");',
  'let msg = error.message || "Unknown error"; if (msg === "Failed to fetch") msg = "Selected location is too far from our studios (Max 20 km) or network error."; setCalcError(msg);'
);
fs.writeFileSync('frontend/src/components/booking/Step7Payment.tsx', content, 'utf8');
