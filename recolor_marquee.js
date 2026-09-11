const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use a simple replace approach
content = content.replace(
  'bg-white border border-gray-100 rounded-2xl \nshadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-indigo-100 transition-colors \ncursor-default">\n                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center',
  'bg-indigo-50 border border-indigo-100 rounded-2xl \nshadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-indigo-200 transition-colors \ncursor-default">\n                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center'
);

content = content.replace(
  '<h4 className="font-extrabold text-sm text-gray-900 leading-tight">20% Down Payment</h4>\n                    <p className="text-xs text-gray-500 mt-1 font-medium">Book full events easily</p>',
  '<h4 className="font-extrabold text-sm text-indigo-950 leading-tight">20% Down Payment</h4>\n                    <p className="text-xs text-indigo-700 mt-1 font-medium">Book full events easily</p>'
);

content = content.replace(
  'bg-white border border-gray-100 rounded-2xl \nshadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-blue-100 transition-colors \ncursor-default">\n                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center',
  'bg-purple-50 border border-purple-100 rounded-2xl \nshadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-purple-200 transition-colors \ncursor-default">\n                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center'
);

content = content.replace(
  '<h4 className="font-extrabold text-sm text-gray-900 leading-tight">No-Cost EMI Available</h4>\n                    <p className="text-xs text-gray-500 mt-1 font-medium">Pay in flexible installments</p>',
  '<h4 className="font-extrabold text-sm text-purple-950 leading-tight">No-Cost EMI Available</h4>\n                    <p className="text-xs text-purple-700 mt-1 font-medium">Pay in flexible installments</p>'
);

content = content.replace(
  'bg-gradient-to-r from-emerald-500 to-teal-500 \nborder border-emerald-400',
  'bg-gradient-to-r from-purple-600 to-indigo-600 \nborder border-purple-500'
);

content = content.replace(
  '<h4 className="font-extrabold text-sm text-white leading-tight">Get ₹1500 Bonus</h4>',
  '<h4 className="font-extrabold text-sm text-white leading-tight">Get ₹500 Bonus</h4>'
);

content = content.replace(
  '<h4 className="font-extrabold text-sm text-white leading-tight">Get ₹500 Bonus</h4>\n                    <p className="text-xs text-emerald-50 mt-1 font-medium">Sign up & claim in wallet</p>',
  '<h4 className="font-extrabold text-sm text-white leading-tight">Get ₹500 Bonus</h4>\n                    <p className="text-xs text-purple-100 mt-1 font-medium">Sign up & claim in wallet</p>'
);

content = content.replace(
  'bg-white border border-gray-100 rounded-2xl \nshadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-green-100 transition-colors \ncursor-default">\n                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center',
  'bg-fuchsia-50 border border-fuchsia-100 rounded-2xl \nshadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-fuchsia-200 transition-colors \ncursor-default">\n                  <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-700 rounded-xl flex items-center justify-center'
);

content = content.replace(
  '<h4 className="font-extrabold text-sm text-gray-900 leading-tight">100% Quality Assured</h4>\n                    <p className="text-xs text-gray-500 mt-1 font-medium">In-house professional shoots</p>',
  '<h4 className="font-extrabold text-sm text-fuchsia-950 leading-tight">100% Quality Assured</h4>\n                    <p className="text-xs text-fuchsia-700 mt-1 font-medium">In-house professional shoots</p>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete');
