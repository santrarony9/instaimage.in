import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">InstaImage</h3>
            <p className="text-gray-400 text-sm md:text-base">Capturing moments, creating memories. Book professional sellers on-demand.</p>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li><Link href="/services" className="hover:text-white transition-colors">All Services</Link></li>
              <li><Link href="/become-a-photographer" className="hover:text-white transition-colors">Become a Creator</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
              <li><Link href="/reviews" className="hover:text-white transition-colors">Reviews</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold mb-4 text-sm md:text-base">Legal</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4 text-sm md:text-base">Support & Contact</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/seller/login" className="hover:text-white transition-colors font-semibold text-blue-400">Creator Login</Link></li>
              <li className="pt-4 mt-4 border-t border-gray-800"><a href="mailto:info.instaimage@gmail.com" className="hover:text-white transition-colors break-all">info.instaimage@gmail.com</a></li>
              <li><a href="tel:+918240508915" className="hover:text-white transition-colors">+91 8240508915</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} InstaImage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
