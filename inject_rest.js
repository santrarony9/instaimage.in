const fs = require('fs');
let file = fs.readFileSync('d:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx', 'utf8');

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

file = file.replace(target, replacement);

const s2 = '{/* Dedicated Event Managers Section */}';
const s3 = '{/* Popular Services Section */}';
const s4 = '{/* Newly Added Section */}';
const s5 = '{/* Category Specific Rows */}';

const i2 = file.indexOf(s2);
const i3 = file.indexOf(s3);
const i4 = file.indexOf(s4);
const i5 = file.indexOf(s5);

if (i2 !== -1 && i3 !== -1 && i4 !== -1 && i5 !== -1) {
    const block2 = file.substring(i2, i3);
    const block3 = file.substring(i3, i4);
    const block4 = file.substring(i4, i5);

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
    file = file.substring(0, i2) + newLayout + file.substring(i5);
    
    // Add imports
    file = file.replace("import { HeroSearchBar } from '@/components/ui/HeroSearchBar';", "import { FlashSaleBanner } from '@/components/ui/FlashSaleBanner';\nimport { SmartConcierge } from '@/components/ui/SmartConcierge';");

    // Replace Hero Search Bar
    const targetHero = `<p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Book trusted photographers, drone pilots, and editors instantly. Get your memories captured and delivered in as little as 24 hours.
          </p>
          
          <HeroSearchBar />
        </div>
      </div>`;
    const replaceHero = `<p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8 md:mb-16">
            Book trusted photographers, drone pilots, and editors instantly. Get your memories captured and delivered in as little as 24 hours.
          </p>
        </div>
      </div>
      
      {/* Smart Concierge Overlay */}
      <div className="-mt-16 md:-mt-24 px-4 sm:px-6 relative z-40 mb-16">
        <SmartConcierge />
      </div>`;
    file = file.replace(targetHero, replaceHero);

    fs.writeFileSync('d:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx', file, 'utf8');
    console.log("Success 2");
} else {
    console.log("Failed to find bounds");
}
