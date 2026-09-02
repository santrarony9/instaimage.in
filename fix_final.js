const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Normalize line endings to avoid regex mismatches
content = content.replace(/\r\n/g, '\n');

// 1. Imports
content = content.replace(
  "import { WebSiteJsonLd } from '@/components/seo/JsonLd';",
  "import { CreditCard, Wallet, Percent, ShieldCheck } from 'lucide-react';\nimport { WebSiteJsonLd } from '@/components/seo/JsonLd';"
);

// We know the first replace didn't add SmartConcierge because HeroSearchBar replace failed earlier. Let's make sure it's added.
if (!content.includes('SmartConcierge')) {
    content = content.replace(
      "import { HeroMarquee } from '@/components/ui/HeroMarquee';",
      "import { FlashSaleBanner } from '@/components/ui/FlashSaleBanner';\nimport { SmartConcierge } from '@/components/ui/SmartConcierge';\nimport { HeroMarquee } from '@/components/ui/HeroMarquee';"
    );
}

// 2. Mock FlashSale data
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
content = content.replace(/  return \(\n    <div className="bg-gray-50 min-h-screen pb-20">/, dataInject + '\n    <div className="bg-gray-50 min-h-screen pb-20">');

// 3. Hero overlay replace
content = content.replace(/<HeroSearchBar \/>/, '<SmartConcierge />');
content = content.replace('max-w-2xl mx-auto mb-8">', 'max-w-2xl mx-auto mb-8 md:mb-16">');
content = content.replace('<div className="w-full relative z-30 mb-10 overflow-hidden">', '<div className="w-full relative z-30 mb-10 overflow-hidden -mt-16 md:-mt-24 px-4 sm:px-6">');


fs.writeFileSync(path, content, 'utf8');
console.log("Updated successfully");
