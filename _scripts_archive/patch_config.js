const fs = require('fs');
let content = fs.readFileSync('backend/apps/api/src/modules/bookings/bookings.service.ts', 'utf8');

const targetRegex = /const travelConfig = await this\.settingsService\.getSetting\('travelChargeConfig'\);\s*let deliveryDiscount = 0;\s*if \(travelConfig\?\.isFreeOfferActive\) \{\s*deliveryDiscount = deliveryCharge;\s*\}/m;
content = content.replace(targetRegex, "let deliveryDiscount = 0;");
fs.writeFileSync('backend/apps/api/src/modules/bookings/bookings.service.ts', content, 'utf8');
console.log("Patched travel config out");
