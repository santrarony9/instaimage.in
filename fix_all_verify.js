const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/backend/apps/api/src/modules/bookings/bookings.service.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /findById\(id\)/g,
  `findOne(id.startsWith('BKG-') ? { bookingId: id } : { _id: id })`
);

content = content.replace(
  /findById\(bookingId\)/g,
  `findOne(bookingId.startsWith('BKG-') ? { bookingId: bookingId } : { _id: bookingId })`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed all findById calls in bookings service to support friendly IDs');
