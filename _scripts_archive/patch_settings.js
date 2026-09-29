const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/(dashboard)/admin/settings/page.tsx', 'utf8');

// The block to remove starts at {/* Travel Charge Config */} and ends just before     </div>\r?\n  );\r?\n}
const startRegex = /\{\/\*\s*Travel Charge Config\s*\*\/\}/;
const match = content.match(startRegex);

if (match) {
  const startIdx = match.index;
  const endIdx = content.lastIndexOf('    </div>');
  
  if (endIdx > startIdx) {
    content = content.substring(0, startIdx) + content.substring(endIdx);
    fs.writeFileSync('frontend/src/app/(dashboard)/admin/settings/page.tsx', content, 'utf8');
    console.log("Patched settings page!");
  } else {
    console.log("Could not find end index");
  }
} else {
  console.log("Could not find start index");
}
