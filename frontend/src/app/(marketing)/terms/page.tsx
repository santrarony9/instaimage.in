import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | InstaImage',
  description: 'Terms of Service and User Agreement for INSTAIMAGE (Kolkata, India).',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-gray-800">
      <div className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Effective Date: August 30, 2026 | Enterprise: INSTAIMAGE (Udyam Reg: UDYAM-WB-18-0211603)
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-6 text-sm sm:text-base leading-relaxed">
        <p>
          Welcome to <strong>INSTAIMAGE</strong> (&ldquo;InstaImage&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), registered under the Ministry of Micro, Small and Medium Enterprises, Government of India (Udyam Registration Number: <strong>UDYAM-WB-18-0211603</strong>). These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Customer&rdquo;, or &ldquo;Service Provider&rdquo;) and INSTAIMAGE, governing your access to and use of our marketplace platform (<a href="https://instaimage.in" className="text-black font-semibold underline">https://instaimage.in</a>) and professional photography, videography, and event media services.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          1. Platform Marketplace & Services
        </h2>
        <p>
          INSTAIMAGE operates an on-demand marketplace connecting customers with verified professional photographers, videographers, editors, and drone operators in Kolkata and surrounding service zones. We facilitate booking scheduling, customer support, and secure payment processing.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          2. Account Registration & WhatsApp Verification
        </h2>
        <p>
          To access bookings and creator dashboards, you must register using an authentic name and valid mobile phone number.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>WhatsApp OTP Authentication:</strong> Registration and authentication require verification via a 6-digit WhatsApp OTP code sent to your registered mobile number.</li>
          <li><strong>Account Security:</strong> You are responsible for all activities occurring under your account session. Sessions remain securely active for up to 15 days on authorized devices.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          3. Bookings, Payments & Advances
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Booking Confirmation:</strong> Bookings are locked and confirmed upon payment of the required booking advance through our verified payment gateway.</li>
          <li><strong>Pricing & Taxes:</strong> All pricing listed on the platform is in Indian Rupees (INR) and includes applicable service charges unless explicitly stated.</li>
          <li><strong>Wallet & Promo Codes:</strong> Welcome bonuses (e.g. ₹500 wallet credit) and promotional coupons apply towards eligible bookings per terms outlined at checkout.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          4. Rescheduling, Cancellations & Refunds
        </h2>
        <p>
          Cancellations or reschedule requests must be submitted through your customer dashboard. Refund eligibility and applicable deduction fees depend on the time remaining before the scheduled shoot:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Cancellations made more than 48 hours before the shoot qualify for a full refund or wallet credit.</li>
          <li>Late cancellations within 24 hours of the scheduled shoot may incur a partial creator compensation fee.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          5. Intellectual Property & Media Deliverables
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Customer License:</strong> Customers receive a perpetual, non-exclusive license for personal and commercial usage of the delivered photographs/videos.</li>
          <li><strong>Portfolio Rights:</strong> Service providers and INSTAIMAGE retain reasonable promotional usage rights for portfolio showcases unless a non-disclosure agreement (NDA) is requested prior to the shoot.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          6. Governing Law & Dispute Resolution
        </h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes or claims arising out of or in connection with these Terms or the platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Kolkata, West Bengal, India</strong>.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          7. Registered Enterprise Information
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-2 text-sm">
          <p className="font-bold text-gray-900 text-base">INSTAIMAGE</p>
          <p><strong>Proprietorship:</strong> Priyanka Santra</p>
          <p><strong>Udyam Registration Number:</strong> UDYAM-WB-18-0211603</p>
          <p><strong>Registered Address:</strong> 85, Tilottama Plaza, Karunamoyee Ghat Road, Kolkata, South 24 Parganas, West Bengal - 700082, India</p>
          <p><strong>Email:</strong> <a href="mailto:info.instaimage@gmail.com" className="text-black font-semibold underline">info.instaimage@gmail.com</a> / <a href="mailto:support@instaimage.in" className="text-black font-semibold underline">support@instaimage.in</a></p>
          <p><strong>Phone / WhatsApp:</strong> +91 94778 33176</p>
        </div>
      </div>
    </div>
  );
}
