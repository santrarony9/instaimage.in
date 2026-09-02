import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
title: 'Become a Photographer | InstaImage',
description: 'Join InstaImage as a professional photographer or videographer and start receiving high-quality bookings.',
};

export default function BecomePhotographerPage() {
return (
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
<div className="text-center mb-12">
<h1 className="text-4xl font-bold mb-4">Join Our Creator Network</h1>
<p className="text-xl text-gray-600">Turn your passion into profit with InstaImage.</p>
</div>
<div className="bg-white p-8 rounded-lg border shadow-sm max-w-2xl mx-auto">
<h2 className="text-2xl font-bold mb-6">Apply Now</h2>
<form className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
<input type="text" className="w-full p-2 border rounded" placeholder="John Doe" />
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
<input type="email" className="w-full p-2 border rounded" placeholder="john@example.com" />
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Link</label>
<input type="url" className="w-full p-2 border rounded" placeholder="https://instagram.com/..." />
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Primary Specialty</label>
<select className="w-full p-2 border rounded">
<option>Wedding Photography</option>
<option>Corporate Events</option>
<option>Drone / Aerial</option>
<option>Fashion & Portraits</option>
</select>
</div>
<Link href="/seller/register" className="block w-full text-center bg-black text-white font-bold py-3 rounded hover:bg-gray-800">
Submit Application
</Link>
</form>
</div>
</div>
);
}
