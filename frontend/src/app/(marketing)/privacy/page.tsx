import { Metadata } from 'next';

export const metadata: Metadata = {
title: 'Privacy Policy | InstaImage',
description: 'Privacy Policy and data protection guidelines for InstaImage.',
};

export default function PrivacyPage() {
return (
<div className="max-w-3xl mx-auto px-4 py-20">
<h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
<p className="text-gray-500 mb-8">Last updated: August 25, 2026</p>
<p className="mb-6">At InstaImage, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our platform or use our professional photography and videography services.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
<p className="mb-4">We collect information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. This includes:</p>
<ul className="list-disc pl-6 mb-6 space-y-2">
  <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and physical address.</li>
  <li><strong>Payment Data:</strong> Data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument.</li>
  <li><strong>Service Data:</strong> Details about the services you book, event locations, and special requests.</li>
</ul>

<h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
<p className="mb-4">We use the information we collect or receive for various business purposes, including:</p>
<ul className="list-disc pl-6 mb-6 space-y-2">
  <li>To facilitate account creation and logon process.</li>
  <li>To fulfill and manage your bookings, payments, and service deliveries.</li>
  <li>To communicate with you regarding your bookings or customer support inquiries.</li>
  <li>To improve our platform and user experience.</li>
</ul>

<h2 className="text-2xl font-bold mt-8 mb-4">3. Sharing Your Information</h2>
<p className="mb-6">We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf. For example, we share necessary booking details with the specific photographers or drone operators you hire through our platform so they can fulfill the service. We do not sell your personal information to third parties.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
<p className="mb-6">We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">5. Your Privacy Rights</h2>
<p className="mb-6">Depending on your location, you may have certain rights regarding your personal information, such as the right to request access to, correct, or delete your data. You can review and change your personal information by logging into your account settings.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">6. Contact Us</h2>
<p className="mb-6">If you have questions or comments about this policy, you may email us at privacy@instaimage.in.</p>
</div>
);
}
