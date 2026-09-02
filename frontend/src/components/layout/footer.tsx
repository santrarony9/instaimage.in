import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-8 text-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-4 mb-6">
          <div className="col-span-2 lg:col-span-2 pr-4">
            <h3 className="text-white text-base font-bold mb-3 tracking-tight">InstaImage</h3>
            <p className="text-xs max-w-xs leading-relaxed">Capturing moments, creating memories. Book professional photographers, drone operators, and editors instantly.</p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/services" className="hover:text-white transition-colors">All Services</Link></li>
              <li><Link href="/become-a-photographer" className="hover:text-white transition-colors">Become a Creator</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
              <li><Link href="/seller/login" className="hover:text-white transition-colors">Creator Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/faq" className="hover:text-white transition-colors">Help Center & FAQ</Link></li>
              <li><a href="mailto:info.instaimage@gmail.com" className="hover:text-white transition-colors">info.instaimage@gmail.com</a></li>
              <li><a href="tel:+918240508915" className="hover:text-white transition-colors">+91 8240508915</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] md:text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} InstaImage. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Made in Kolkata</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
