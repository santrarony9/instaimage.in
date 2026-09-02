import os

path = r"d:\anti gravity\InstaImage_Source_Code (1)\frontend\src\app\(marketing)\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { HeroSearchBar } from '@/components/ui/HeroSearchBar';",
    "import { FlashSaleBanner } from '@/components/ui/FlashSaleBanner';\nimport { SmartConcierge } from '@/components/ui/SmartConcierge';"
)

# 2. FlashSale data
target = """    // Fallbacks if no images in database
    allImages = [
      "/og-image.jpg"
    ];
  }

  return ("""

replacement = """    // Fallbacks if no images in database
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

  return ("""

content = content.replace(target, replacement)

# 3. Hero overlay
target_hero = """          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Book trusted photographers, drone pilots, and editors instantly. Get your memories captured and delivered in as little as 24 hours.
          </p>
          
          <HeroSearchBar />
        </div>
      </div>
      
      {/* E-Commerce Offer Cards (Automatic Marquee) */}
      <div className="w-full relative z-30 mb-10 overflow-hidden">"""

replacement_hero = """          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8 md:mb-16">
            Book trusted photographers, drone pilots, and editors instantly. Get your memories captured and delivered in as little as 24 hours.
          </p>
        </div>
      </div>
      
      {/* Smart Concierge Overlay */}
      <div className="-mt-16 md:-mt-24 px-4 sm:px-6 relative z-40 mb-16">
        <SmartConcierge />
      </div>
      
      {/* E-Commerce Offer Cards (Automatic Marquee) */}
      <div className="w-full relative z-30 mb-10 overflow-hidden">"""

content = content.replace(target_hero, replacement_hero)

# 4. Extract layout sections and inject FlashSaleBanner
s2 = '{/* Dedicated Event Managers Section */}'
s3 = '{/* Popular Services Section */}'
s4 = '{/* Newly Added Section */}'
s5 = '{/* Category Specific Rows */}'

i2 = content.find(s2)
i3 = content.find(s3)
i4 = content.find(s4)
i5 = content.find(s5)

if i2 != -1 and i3 != -1 and i4 != -1 and i5 != -1:
    block2 = content[i2:i3]
    block3 = content[i3:i4]
    block4 = content[i4:i5]
    
    flashSaleBlock = """
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
"""
    newLayout = block4 + flashSaleBlock + '\n\n' + block3 + block2
    content = content[:i2] + newLayout + content[i5:]

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
