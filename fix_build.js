const fs = require('fs');
const path1 = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/components/cart/CartSidebar.tsx';
const path2 = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(dashboard)/admin/leads/page.tsx';

// Fix CartSidebar
let content1 = fs.readFileSync(path1, 'utf8');
content1 = content1.replace("import { toast } from 'react-hot-toast';", "");
content1 = content1.replace(/toast\.error\(/g, "alert(");
content1 = content1.replace(/toast\.success\(/g, "alert(");
fs.writeFileSync(path1, content1, 'utf8');

// Fix Admin Leads Page
let content2 = fs.readFileSync(path2, 'utf8');
content2 = content2.replace("import { Card } from '@/components/ui/card';", "");
content2 = content2.replace(/<Card key={lead\._id} className="p-6">/g, `<div key={lead._id} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">`);
content2 = content2.replace(/<\/Card>/g, `</div>`);
// Remove the BOM at start if it exists
if (content2.charCodeAt(0) === 0xFEFF) {
  content2 = content2.slice(1);
}
fs.writeFileSync(path2, content2, 'utf8');

console.log('Fixed build errors');
