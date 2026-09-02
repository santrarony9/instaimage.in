"use client";

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Download } from 'lucide-react';
import Link from 'next/link';

function GalleryContent() {
  const router = useRouter();
  const [bookingsWithGalleries, setBookingsWithGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const data = await fetchApi(`/bookings/my-bookings`);
        const bookings = Array.isArray(data) ? data : [];
        const withGalleries = bookings.filter((b: any) => b.gallery && b.gallery.length > 0);
        setBookingsWithGalleries(withGalleries);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading gallery...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Master Photo Gallery</h1>
        </div>
      </div>
      
      {bookingsWithGalleries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Download className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No photos available yet</h3>
          <p className="text-gray-500 max-w-sm">When your photographer uploads photos to your bookings, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {bookingsWithGalleries.map((booking: any) => (
            <div key={booking._id} className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {booking.serviceId?.name || 'Photography Shoot'}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
                <Link 
                  href={`/customer/bookings/${booking._id}`}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full transition-colors"
                >
                  View Booking
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {booking.gallery.filter((p: any) => p.url).map((photo: any, i: number) => (
                  <div key={photo._id || i} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                    <Image 
                      src={photo.url || ''} 
                      alt={photo.filename || `Gallery Image ${i + 1}`} 
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <a 
                        href={photo.url} 
                        download={photo.filename} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-white/90 backdrop-blur-sm text-black text-center text-sm px-4 py-2 rounded-full font-bold shadow-lg hover:bg-white hover:scale-105 transition-all w-full flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> HD
                      </a>
                    </div>
                  </div>
                ))}
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
