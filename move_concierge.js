const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// 1. Add HeroSearchBar import
let importIdx = lines.findIndex(l => l.includes("import { SmartConcierge }"));
if (importIdx !== -1 && !lines.find(l => l.includes('HeroSearchBar'))) {
  lines.splice(importIdx + 1, 0, "import { HeroSearchBar } from '@/components/ui/HeroSearchBar';");
}

// 2. Fix the paragraph margin in Hero
let pIdx = lines.findIndex(l => l.includes('<p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8 md:mb-16">'));
if (pIdx !== -1) {
  lines[pIdx] = lines[pIdx].replace('mb-8 md:mb-16', 'mb-8');
}

// 3. Replace SmartConcierge with HeroSearchBar in the Hero
let smartIdx = lines.findIndex(l => l.trim() === '<SmartConcierge />');
if (smartIdx !== -1) {
  lines[smartIdx] = lines[smartIdx].replace('<SmartConcierge />', '<HeroSearchBar />');
}

// 4. Fix Marquee negative margin which was meant to overlap the huge SmartConcierge
let marqueeIdx = lines.findIndex(l => l.includes('overflow-hidden -mt-16 md:-mt-24 px-4 sm:px-6'));
if (marqueeIdx !== -1) {
  lines[marqueeIdx] = lines[marqueeIdx].replace('-mt-16 md:-mt-24 px-4 sm:px-6', '');
}
// Clean up the BOM character if it's there
let bomIdx = lines.findIndex(l => l.includes('E-Commerce Offer Cards (Automatic Marquee)'));
if (bomIdx !== -1) {
  lines[bomIdx] = lines[bomIdx].replace('\uFEFF', '');
}

// 5. Inject SmartConcierge at the bottom of the shop div
let categoriesEnd = lines.findIndex(l => l.trim() === '})}');
if (categoriesEnd !== -1) {
  // Check if we already injected it
  if (!lines[categoriesEnd + 2].includes('<SmartConcierge />')) {
    lines.splice(categoriesEnd + 1, 0, 
      '',
      '        {/* Smart Concierge - Placed at bottom per user request */}',
      '        <div className="mb-20 px-4 sm:px-0">',
      '          <SmartConcierge />',
      '        </div>'
    );
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log("Updated correctly.");
