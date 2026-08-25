import { Metadata } from 'next';

export const metadata: Metadata = {
title: 'Refund Policy | InstaImage',
description: 'Cancellation and Refund Policy for InstaImage photography services.',
};

export default function RefundPage() {
return (
<div className="max-w-3xl mx-auto px-4 py-20">
<h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
<p className="text-gray-500 mb-8">Last updated: August 25, 2026</p>
<p className="mb-6">At InstaImage, our goal is to provide exceptional photography and videography services. We understand that plans can change, and we have established this Refund and Cancellation Policy to ensure a fair process for both our customers and our Service Providers.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">1. Cancellations by the Customer</h2>
<p className="mb-4">If you need to cancel a booked service, the following refund rules apply:</p>
<ul className="list-disc pl-6 mb-6 space-y-2">
  <li><strong>More than 48 hours notice:</strong> Cancellations made at least 48 hours prior to the scheduled start time of the shoot are eligible for a 100% full refund.</li>
  <li><strong>24 to 48 hours notice:</strong> Cancellations made between 24 and 48 hours before the shoot are eligible for a 50% refund. The remaining 50% compensates the Service Provider for reserving their time.</li>
  <li><strong>Less than 24 hours notice:</strong> Cancellations made less than 24 hours before the shoot, or failure to show up ("no-shows"), are not eligible for a refund.</li>
</ul>

<h2 className="text-2xl font-bold mt-8 mb-4">2. Cancellations by the Service Provider</h2>
<p className="mb-6">In the rare event that a Service Provider must cancel a booking due to an emergency or unforeseen circumstances, InstaImage will immediately attempt to match you with a replacement photographer of equal or higher caliber at no extra cost. If a suitable replacement cannot be found or you decline the replacement, you will receive a 100% full refund.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">3. Weather-Related Rescheduling</h2>
<p className="mb-6">For outdoor shoots, inclement weather can be a factor. If the weather is deemed unsuitable by both you and the Service Provider, you may reschedule the shoot to a mutually agreed-upon date without penalty. If rescheduling is impossible, a full refund will be provided.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">4. Dissatisfaction with Final Deliverables</h2>
<p className="mb-6">Photography is a subjective art form. However, if the final delivered media significantly deviates from the Service Provider's portfolio or fails to meet the basic professional standards outlined in your booking agreement (e.g., severe technical issues, failure to capture key moments), you may dispute the booking within 3 days of receiving the files. InstaImage will mediate the dispute and, if warranted, issue a partial or full refund.</p>

<h2 className="text-2xl font-bold mt-8 mb-4">5. Processing Refunds</h2>
<p className="mb-6">Approved refunds will be processed immediately by InstaImage and credited back to your original payment method. Please allow 5-7 business days for the funds to appear on your bank or credit card statement, depending on your financial institution.</p>
</div>
);
}
