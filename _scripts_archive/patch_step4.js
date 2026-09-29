const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/booking/Step4Location.tsx', 'utf8');

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
  "const [city, setCity] = useState(data.location?.city || '');",
  "const [city, setCity] = useState(data.location?.city || '');\n  const VALID_PINCODES = " + JSON.stringify(validPins) + ";"
);

newContent = newContent.replace(
  "if (!pincode.trim() || !/^\\d{6}$/.test(pincode)) newErrors.pincode = 'Valid 6-digit pincode is required';",
  "if (!pincode.trim() || !/^\\d{6}$/.test(pincode)) newErrors.pincode = 'Valid 6-digit pincode is required';\n      else if (!VALID_PINCODES.includes(pincode.trim())) newErrors.pincode = 'Sorry, InstaImage is currently not available in your area.';"
);

newContent = newContent.replace(
  '{errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}',
  '{errors.pincode ? <p className="text-red-500 text-sm mt-1">{errors.pincode}</p> : (pincode.length === 6 && VALID_PINCODES.includes(pincode) && <p className="text-green-600 text-sm mt-1 font-medium">🎉 Great! InstaImage is available in your area.</p>)}'
);

fs.writeFileSync('frontend/src/components/booking/Step4Location.tsx', newContent);
console.log("Patched Step4Location.tsx");
