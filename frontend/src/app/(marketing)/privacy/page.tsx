import { Metadata } from 'next';

export const metadata: Metadata = {
title: 'Privacy Policy | InstaImage',
description: 'Privacy Policy and data protection guidelines for InstaImage.',
};

export default function PrivacyPage() {
return (
<div className="max-w-3xl mx-auto px-4 py-20 prose">
<h1>Privacy Policy</h1>
<p>Last updated: August 20, 2026</p>
<p>We respect your privacy and are committed to protecting your personal data.</p>
<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us when you create an account, book a service, or communicate with us.</p>
</div>
);
}
