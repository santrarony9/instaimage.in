import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | InstaImage',
  description: 'Privacy Policy and data protection guidelines for INSTAIMAGE (Kolkata, India).',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-gray-800">
      <div className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Effective Date: August 30, 2026 | Enterprise: INSTAIMAGE (Udyam Reg: UDYAM-WB-18-0211603)
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-6 text-sm sm:text-base leading-relaxed">
        <p>
          At <strong>INSTAIMAGE</strong> (&ldquo;InstaImage&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), registered under the Ministry of Micro, Small and Medium Enterprises, Government of India (Udyam Registration Number: <strong>UDYAM-WB-18-0211603</strong>) and operating from Kolkata, West Bengal, India, we are dedicated to safeguarding your privacy and protecting your personal data in full compliance with the <em>Information Technology Act, 2000</em>, the <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em>, and applicable Indian regulations.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          1. Information We Collect
        </h2>
        <p>We collect information you provide directly to us when creating an account, booking a photography or videography service, or communicating with us:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Identification Details:</strong> Full name, email address, physical address/event location in Kolkata and covered service regions.</li>
          <li><strong>WhatsApp & Mobile Number:</strong> Your verified mobile phone number for OTP (One-Time Password) account authentication, booking alerts, and photographer coordination.</li>
          <li><strong>Payment Information:</strong> Transaction identifiers and payment status handled securely through certified payment gateways (Razorpay/Stripe). We do not store full credit/debit card details on our servers.</li>
          <li><strong>Media & Booking Assets:</strong> Photographs, event details, package selections, and customer reviews related to your bookings.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          2. How We Use Your Information
        </h2>
        <p>Your personal data is used solely for legitimate business operations:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To verify your identity and facilitate passwordless login via <strong>WhatsApp OTP</strong>.</li>
          <li>To process service bookings, assign verified local photographers/videographers, and coordinate on-site media shoots.</li>
          <li>To send critical transactional notifications, booking confirmations, payment receipts, and delivery updates via WhatsApp and Email.</li>
          <li>To maintain platform security, prevent fraud, and comply with statutory obligations in India.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          3. WhatsApp Business Communication & Meta Cloud API
        </h2>
        <p>
          By providing your phone number, you consent to receive transactional notifications and authentication codes from <strong>InstaImage (+91 94778 33176)</strong> via the <strong>Meta WhatsApp Cloud API</strong>. We do not use your phone number for unsolicited third-party marketing, and your communication preferences can be managed via account settings.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          4. Data Sharing & Third Parties
        </h2>
        <p>We never sell, rent, or trade your personal data. We only share necessary details with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Assigned Service Providers:</strong> The specific photographer, videographer, or drone pilot assigned to your shoot (location and contact info only).</li>
          <li><strong>Infrastructure & Technology Partners:</strong> Meta Platforms Inc. (WhatsApp Cloud API for message delivery), secure cloud storage (Backblaze B2/AWS), and payment processors.</li>
          <li><strong>Legal Authorities:</strong> When required by court order, law enforcement, or statutory regulations under Indian jurisdiction.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          5. Data Security & Storage
        </h2>
        <p>
          We employ industry-standard encryption protocols (SSL/TLS, hashed OTPs, secure cloud vaults) to protect your personal data from unauthorized access, alteration, or disclosure.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          6. Your Rights & Data Deletion
        </h2>
        <p>
          Under Indian data privacy regulations, you have the right to review, update, or request the deletion of your personal data. You can exercise these rights at any time by contacting our grievance team.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">
          7. Registered Enterprise & Grievance Contact
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-2 text-sm">
          <p className="font-bold text-gray-900 text-base">INSTAIMAGE</p>
          <p><strong>Proprietor / Grievance Officer:</strong> Priyanka Santra</p>
          <p><strong>Udyam Registration Number:</strong> UDYAM-WB-18-0211603</p>
          <p><strong>Registered Address:</strong> 85, Tilottama Plaza, Karunamoyee Ghat Road, Kolkata, South 24 Parganas, West Bengal - 700082, India</p>
          <p><strong>Official Email:</strong> <a href="mailto:info.instaimage@gmail.com" className="text-black font-semibold underline">info.instaimage@gmail.com</a> / <a href="mailto:support@instaimage.in" className="text-black font-semibold underline">support@instaimage.in</a></p>
          <p><strong>Official Contact / WhatsApp:</strong> +91 94778 33176</p>
          <p><strong>Website:</strong> <a href="https://instaimage.in" className="text-black font-semibold underline">https://instaimage.in</a></p>
        </div>
      </div>
    </div>
  );
}
