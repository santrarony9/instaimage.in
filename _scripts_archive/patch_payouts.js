const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/(dashboard)/admin/payouts/page.tsx', 'utf8');
content = content.replace(/<div><span className="text-gray-500">Platform Fee:<\/span> ₹\{b\.pricing\?\.platformFee\}<\/div>/g, '');
fs.writeFileSync('frontend/src/app/(dashboard)/admin/payouts/page.tsx', content, 'utf8');
console.log("Patched payouts page");
