"use client";

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function GalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams?.get('booking');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchApi(`/bookings/${bookingId}`);
        setBooking(data);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, [bookingId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading gallery...</div>;
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Booking not found or not specified.</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const photos = booking.gallery || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href={`/customer/bookings/${bookingId}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 w-max">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Booking
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Photo Gallery</h1>
          {photos.length > 0 && (
            <button className="bg-black text-white px-4 py-2 rounded shadow text-sm hover:bg-gray-800 transition">
              Download All (ZIP)
            </button>
          )}
        </div>
      </div>
      
      {photos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <p className="text-gray-500">No photos have been uploaded to this gallery yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.filter((p: any) => p.url).map((photo: any, i: number) => (
            <div key={photo._id || i} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
              <Image 
                src={photo.url || ''} 
                alt={photo.filename || `Gallery Image ${i + 1}`} 
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={i < 3}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <a href={photo.url} download={photo.filename} target="_blank" rel="noreferrer" className="bg-white text-black text-center text-sm px-4 py-2 rounded font-medium shadow w-max hover:bg-gray-100 block">
                  Download HD
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading gallery...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
