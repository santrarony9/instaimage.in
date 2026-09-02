const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  "import { HeroSearchBar } from '@/components/ui/HeroSearchBar';",
  "import { FlashSaleBanner } from '@/components/ui/FlashSaleBanner';\nimport { SmartConcierge } from '@/components/ui/SmartConcierge';"
);

// 2. FlashSale Data (Search for "return (" that is BEFORE `<div className="bg-gray-50 min-h-screen pb-20">`)
const dataInject = `
  // Find active Flash Sale from backend
  let flashSaleBanner = banners.find(b => b.type === 'FLASH_SALE' && b.validUntil && new Date(b.validUntil).getTime() > Date.now());

  if (!flashSaleBanner && process.env.NODE_ENV === 'development') {
    flashSaleBanner = {
      title: 'Weekend Special: Free Drone Coverage!',
      subtitle: 'Book any Wedding Combo today and get premium drone coverage absolutely free.',
      validUntil: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
      redirectUrl: '/services?category=Photography'
    };
  }

  return (`;
content = content.replace(/return \([\s\S]*?<div className="bg-gray-50 min-h-screen pb-20">/, dataInject + '\n    <div className="bg-gray-50 min-h-screen pb-20">');

// 3. Hero overlay replace
content = content.replace(/<HeroSearchBar \/>/, '<SmartConcierge />');
// Fix the container spacing for SmartConcierge so it overflows
content = content.replace('<div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">', '<div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center pb-24 md:pb-32">');
// Pull up the next section
content = content.replace('<div className="w-full relative z-30 mb-10 overflow-hidden">', '<div className="w-full relative z-30 mb-10 overflow-hidden -mt-16 md:-mt-24">');


// 4. Inject FlashSaleBanner right before Category Specific Rows
const s5 = '{/* Category Specific Rows */}';
const flashSaleBlock = `
        {/* Flash Sale Countdown (Massive Pattern Interrupt) */}
        {flashSaleBanner && (
          <div className="my-16 relative z-40">
            <FlashSaleBanner 
              title={flashSaleBanner.title}
              subtitle={flashSaleBanner.subtitle || 'Limited time offer!'}
              validUntil={flashSaleBanner.validUntil}
              redirectUrl={flashSaleBanner.redirectUrl}
            />
          </div>
        )}

        `;
content = content.replace(s5, flashSaleBlock + s5);

fs.writeFileSync(path, content, 'utf8');
console.log("Success");
