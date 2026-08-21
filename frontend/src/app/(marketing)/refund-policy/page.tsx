import { Metadata } from 'next';

export const metadata: Metadata = {
title: 'Refund Policy | InstaImage',
description: 'Cancellation and Refund Policy for InstaImage photography services.',
};

export default function RefundPage() {
return (
<div className="max-w-3xl mx-auto px-4 py-20 prose">
<h1>Refund Policy</h1>
<p>Last updated: August 20, 2026</p>
<h2>Cancellations</h2>
<p>Cancellations made 48 hours before the scheduled shoot are eligible for a full refund.</p>
<h2>Refunds</h2>
<p>Refunds will be processed to the original payment method within 5-7 business days.</p>
</div>
);
}
