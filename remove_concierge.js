const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove SmartConcierge import
content = content.replace("import { SmartConcierge } from '@/components/ui/SmartConcierge';\n", "");
content = content.replace("import { SmartConcierge } from '@/components/ui/SmartConcierge';", "");

// 2. Remove the SmartConcierge component call at the bottom
const idx = content.indexOf('{/* Smart Concierge - Placed at bottom per user request */}');
if (idx !== -1) {
    const endIdx = content.indexOf('</div>', idx + 100) + 6; // roughly the closing div
    content = content.substring(0, idx) + content.substring(endIdx);
}

// Ensure clean spacing
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(path, content, 'utf8');
console.log('Removed SmartConcierge from page.tsx');
