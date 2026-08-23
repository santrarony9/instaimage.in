import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 sticky top-0 z-[999]">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="InstaImage Logo" 
              width={180} 
              height={50} 
              priority 
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-6 text-sm font-semibold text-gray-500">
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span>Secure Checkout</span>
            </span>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col pt-4 md:pt-6 pb-4">
        <div className="max-w-3xl mx-auto w-full px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
