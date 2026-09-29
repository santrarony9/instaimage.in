const fs = require('fs');
let content = fs.readFileSync('backend/apps/api/src/modules/bookings/bookings.service.ts', 'utf8');

const regex = /async calculateTravelCharge\([\s\S]*?return \{\s*deliveryCharge,\s*travelDistanceKm,\s*nearestOfficeName,\s*\};\s*\}/m;
content = content.replace(regex, 
"async calculateTravelCharge(clientCoordinates: number[] | undefined | null) {\n    return {\n      deliveryCharge: 0,\n      travelDistanceKm: 0,\n      nearestOfficeName: undefined,\n    };\n  }"
);

fs.writeFileSync('backend/apps/api/src/modules/bookings/bookings.service.ts', content, 'utf8');
console.log("Patched calculateTravelCharge");
