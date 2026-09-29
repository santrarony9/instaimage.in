const fs = require('fs');
const content = fs.readFileSync('backend/apps/api/src/modules/bookings/bookings.service.ts', 'utf8');

const validPins = [
  '700001','700002','700003','700004','700005','700006','700007','700008','700009','700010',
  '700011','700012','700013','700014','700015','700016','700017','700018','700019','700020',
  '700021','700022','700023','700024','700025','700026','700027','700028','700029','700030',
  '700031','700032','700033','700034','700035','700036','700037','700038','700040','700041',
  '700042','700043','700044','700045','700046','700047','700050','700052','700053','700054',
  '700059','700060','700061','700062','700063','700064','700065','700066','700067','700068',
  '700069','700071','700072','700073','700074','700075','700077','700078','700080','700082',
  '700085','700086','700087','700088','700089','700090','700091','700092','700094','700095',
  '700098','700099','700102','700106','700107','700108','700110','700135','700136','700156',
  '700157','700159','700160','700161','743503'
];

let newContent = content.replace(
  'if (!service) throw new NotFoundException(\'Service not found\');',
  'if (!service) throw new NotFoundException(\'Service not found\');\n\n    if (service.deliveryMethod !== \'REMOTE\') {\n      const allowedPins = ' + JSON.stringify(validPins) + ';\n      if (createBookingDto.location?.pincode && !allowedPins.includes(createBookingDto.location.pincode.trim())) {\n        throw new BadRequestException(\'Sorry, InstaImage is currently not available in your area.\');\n      }\n    }'
);

newContent = newContent.replace(
  'if (travelDistanceKm > 20) {',
  'if (travelDistanceKm > 20000000) {'
);

fs.writeFileSync('backend/apps/api/src/modules/bookings/bookings.service.ts', newContent);
console.log("Patched bookings.service.ts");
