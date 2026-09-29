const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/booking/Step7Payment.tsx', 'utf8');
content = content.replace(/let maxTravelDistanceKm = 0;/, '');
content = content.replace(/maxTravelDistanceKm = Math.max\(maxTravelDistanceKm, res.pricing.travelDistanceKm \|\| 0\);/, '');
content = content.replace(/travelDistanceKm: maxTravelDistanceKm,/, '');
content = content.replace(/\{\(p\?\.deliveryCharge > 0 \|\| p\?\.travelDistanceKm > 0\) && data\.deliveryMethod !== 'REMOTE' && \([\s\S]*?\}\)\}/, '');
fs.writeFileSync('frontend/src/components/booking/Step7Payment.tsx', content, 'utf8');
console.log("Patched Step7Payment");
