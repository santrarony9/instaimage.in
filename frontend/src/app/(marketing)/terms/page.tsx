import { Metadata } from 'next';

export const metadata: Metadata = {
title: 'Terms of Service | InstaImage',
description: 'Terms of Service and User Agreement for InstaImage.',
};

export default function TermsPage() {
return (
<div className="max-w-3xl mx-auto px-4 py-20">
<h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
<p className="text-gray-500 mb-8">Last updated: August 25, 2026</p>
<p className="mb-6">Welcome to InstaImage. These Terms of Service ("Terms") govern your use of the InstaImage platform and the photography, videography, and drone services provided through our website. By accessing or using our platform, you agree to be bound by these Terms.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">1. Our Services</h2>
<p className="mb-6">InstaImage operates an online marketplace that connects customers seeking professional photography services with qualified creators, photographers, and drone pilots ("Service Providers"). We facilitate the booking and payment processes, ensuring a seamless experience for all parties.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">2. User Accounts</h2>
<p className="mb-6">To book a service or list your services as a Service Provider, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate. You are responsible for safeguarding your password and for all activities that occur under your account.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">3. Booking and Cancellations</h2>
<p className="mb-6">When you book a service through InstaImage, you enter into a direct agreement with the Service Provider. Cancellations and reschedulings are subject to our standard cancellation policy, which may require advanced notice. Fees may apply for late cancellations.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">4. Payments</h2>
<p className="mb-6">All payments for services must be processed securely through the InstaImage platform. We hold funds in escrow and release them to the Service Provider only after the successful completion and delivery of the media, minus any applicable platform fees.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">5. Intellectual Property and Usage Rights</h2>
<p className="mb-6">Unless otherwise agreed upon in writing, the Service Provider retains the copyright to all media captured during a booking. Customers receive a non-exclusive, perpetual, worldwide license to use, reproduce, and display the media for personal or promotional purposes. Reselling the raw media without permission is prohibited.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">6. Prohibited Activities</h2>
<p className="mb-6">You agree not to use the platform for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. Harassment of Service Providers or customers, fraudulent bookings, and attempts to bypass the platform's payment system are strictly prohibited and will result in immediate account termination.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">7. Limitation of Liability</h2>
<p className="mb-6">InstaImage is not liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of our platform or any services booked through it. Our liability is limited to the maximum extent permitted by law.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">8. Contact Information</h2>
<p className="mb-6">If you have any questions about these Terms, please contact us at support@instaimage.in.</p>
</div>
);
}
