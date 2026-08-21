import { Metadata } from 'next';

export const metadata: Metadata = {
title: 'Terms of Service | InstaImage',
description: 'Terms of Service and User Agreement for InstaImage.',
};

export default function TermsPage() {
return (
<div className="max-w-3xl mx-auto px-4 py-20 prose">
<h1>Terms of Service</h1>
<p>Last updated: August 20, 2026</p>
<p>Welcome to InstaImage. By accessing our platform, you agree to these terms.</p>
<h2>1. Services</h2>
<p>We connect customers with professional photographers and videographers.</p>
<h2>2. Booking & Payments</h2>
<p>All bookings must be confirmed via our secure payment gateway.</p>
</div>
);
}
