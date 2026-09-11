const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/backend/apps/api/src/modules/bookings/bookings.service.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `const booking = await this.bookingsRepository.model.findById(bookingId);`;
const replacement = `let booking;
    // Handle both Mongo _id and friendly BKG-XXXX-XXXX formats
    if (bookingId.startsWith('BKG-')) {
      booking = await this.bookingsRepository.model.findOne({ bookingId });
    } else {
      booking = await this.bookingsRepository.model.findById(bookingId);
    }`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed verifyPayment booking lookup');
