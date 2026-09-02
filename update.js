const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  "import { HeroSearchBar } from '@/components/ui/HeroSearchBar';",
  "import { FlashSaleBanner } from '@/components/ui/FlashSaleBanner';\nimport { SmartConcierge } from '@/components/ui/SmartConcierge';"
);

// 2. FlashSale data
const target = `    // Fallbacks if no images in database
    allImages = [
      "/og-image.jpg"
    ];
  }

  return (`

const replacement = `    // Fallbacks if no images in database
    allImages = [
      "/og-image.jpg"
    ];
  }

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

  return (`

content = content.replace(target, replacement);

// 3. Hero overlay
const target_hero = `          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Book trusted photographers, drone pilots, and editors instantly. Get your memories captured and delivered in as little as 24 hours.
          </p>
          
          <HeroSearchBar />
        </div>
      </div>
      
      {/* E-Commerce Offer Cards (Automatic Marquee) */}
      <div className="w-full relative z-30 mb-10 overflow-hidden">`

const replacement_hero = `          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8 md:mb-16">
            Book trusted photographers, drone pilots, and editors instantly. Get your memories captured and delivered in as little as 24 hours.
          </p>
        </div>
      </div>
      
      {/* Smart Concierge Overlay */}
      <div className="-mt-16 md:-mt-24 px-4 sm:px-6 relative z-40 mb-16">
        <SmartConcierge />
      </div>
      
      {/* E-Commerce Offer Cards (Automatic Marquee) */}
      <div className="w-full relative z-30 mb-10 overflow-hidden">`

content = content.replace(target_hero, replacement_hero);

// 4. Extract layout sections and inject FlashSaleBanner
const s2 = '{/* Dedicated Event Managers Section */}';
const s3 = '{/* Popular Services Section */}';
const s4 = '{/* Newly Added Section */}';
const s5 = '{/* Category Specific Rows */}';

const i2 = content.indexOf(s2);
const i3 = content.indexOf(s3);
const i4 = content.indexOf(s4);
const i5 = content.indexOf(s5);

if (i2 !== -1 && i3 !== -1 && i4 !== -1 && i5 !== -1) {
  const block2 = content.substring(i2, i3);
  const block3 = content.substring(i3, i4);
  const block4 = content.substring(i4, i5);
  
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
  const newLayout = block4 + flashSaleBlock + '\n\n' + block3 + block2;
  content = content.substring(0, i2) + newLayout + content.substring(i5);
}

// 5. CSS Marquee styling fix
const marqueeTarget = `<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30 mb-10">
        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>`;
const marqueeReplace = `<div className="w-full relative z-30 mb-10 overflow-hidden">
        <div className="offer-marquee-container flex w-max hover:[animation-play-state:paused]">`;
content = content.replace(marqueeTarget, marqueeReplace);
content = content.replace('shrink-0 snap-center', 'shrink-0');

const styleTarget = `<style dangerouslySetInnerHTML={{__html: \`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        \`}} />
      </div>`;
const styleReplace = `<style dangerouslySetInnerHTML={{__html: \`
          .offer-marquee-container {
            animation: offers-marquee 25s linear infinite;
          }
          @keyframes offers-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        \`}} />
      </div>`;
content = content.replace(styleTarget, styleReplace);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated successfully");
