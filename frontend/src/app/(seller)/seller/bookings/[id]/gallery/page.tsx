"use client";

import { useEffect, useState, useRef, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { ArrowLeft, Upload, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/use-auth-store';

export default function SellerGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const { id: bookingId } = use(params);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadGallery = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchApi(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, [bookingId, token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        
        await fetchApi(`/bookings/${bookingId}/gallery`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      }
      
      // Reload gallery
      await loadGallery();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload some files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    setDeletingId(imageId);
    try {
      await fetchApi(`/bookings/${bookingId}/gallery/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking((prev: any) => ({
        ...prev,
        gallery: prev.gallery.filter((img: any) => img._id !== imageId)
      }));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading gallery...</div>;
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Booking not found.</p>
        <Link href="/seller/dashboard" className="mt-4 inline-block text-indigo-600 hover:underline">Go Back</Link>
      </div>
    );
  }

  const photos = booking.gallery || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/seller/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 w-max">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Secure Gallery</h1>
            <p className="text-gray-500 text-sm mt-1">Booking: {booking.bookingId || booking._id}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow text-sm font-medium hover:bg-indigo-700 transition flex items-center disabled:opacity-50"
            >
              {uploading ? (
                <span className="flex items-center"><Upload className="mr-2 h-4 w-4 animate-bounce" /> Uploading...</span>
              ) : (
                <span className="flex items-center"><Upload className="mr-2 h-4 w-4" /> Upload Photos</span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {photos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <p className="text-gray-500">No photos have been uploaded to this gallery yet.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 text-indigo-600 font-medium hover:underline"
          >
            Upload your first photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {photos.map((photo: any, i: number) => (
            <div key={photo._id || i} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
              <Image 
                src={photo.url || ''} 
                alt={photo.filename || `Gallery Image ${i + 1}`} 
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(photo._id)}
                  disabled={deletingId === photo._id}
                  className="bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700 transition disabled:opacity-50"
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate" title={photo.filename}>
                  {photo.filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
