const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const sSignup = '{/* Signup Hook Banner */}';
const endSignup = '{/* Premium Category Tiles */}';
const iSignup = content.indexOf(sSignup);
const iTiles = content.indexOf(endSignup);

if (iSignup !== -1 && iTiles !== -1) {
  const marquee = `
      {/* E-Commerce Offer Cards (Automatic Marquee) */}
      <div className="w-full relative z-30 mb-10 overflow-hidden">
        <div className="offer-marquee-container flex w-max hover:[animation-play-state:paused]">
          
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex gap-4 pr-4 pl-4 sm:pl-0">
              
              {/* Card 1: 20% Down Payment */}
              <div className="shrink-0 w-[300px] sm:w-[320px] h-[80px] bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-indigo-100 transition-colors cursor-default">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 leading-tight">20% Down Payment</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Book full events easily</p>
                </div>
              </div>

              {/* Card 2: No-cost EMI */}
              <div className="shrink-0 w-[300px] sm:w-[320px] h-[80px] bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-blue-100 transition-colors cursor-default">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 leading-tight">No-Cost EMI Available</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Pay in flexible installments</p>
                </div>
              </div>

              {/* Card 3: 500 INR Wallet */}
              <div className="shrink-0 w-[300px] sm:w-[320px] h-[80px] bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center p-3 gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white leading-tight">Get ₹1500 Bonus</h4>
                  <p className="text-xs text-emerald-50 mt-1 font-medium">Sign up & claim in wallet</p>
                </div>
              </div>

              {/* Card 4: Verified Professionals */}
              <div className="shrink-0 w-[300px] sm:w-[320px] h-[80px] bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-3 gap-4 hover:border-green-100 transition-colors cursor-default">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 leading-tight">100% Verified Pros</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Background checked & tested</p>
                </div>
              </div>

            </div>
          ))}
          
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .offer-marquee-container {
            animation: offers-marquee 25s linear infinite;
          }
          @keyframes offers-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />
      </div>
      
  `;
  content = content.substring(0, iSignup) + marquee + content.substring(iTiles);
}

// Layout reordering and Flash Sale Injection
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

// Fix HeroSearchBar import
content = content.replace("import { HeroSearchBar } from '@/components/ui/HeroSearchBar';", "");

fs.writeFileSync(path, content, 'utf8');
console.log("Re-applied layout correctly.");
