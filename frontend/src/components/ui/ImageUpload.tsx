'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/api';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  galleryImages?: string[];
}

export default function ImageUpload({ images = [], onChange, maxImages = 5, galleryImages = [] }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (images.length >= maxImages) {
      setError(`You can only upload up to ${maxImages} images.`);
      return;
    }

    const file = e.target.files[0];
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Direct fetch to avoid the default JSON content-type from fetchApi wrapper if it conflicts
      // but fetchApi might be configured to handle FormData. Let's try standard fetchApi first.
      const response = await fetchApi('/uploads', {
        method: 'POST',
        body: formData,
        // Don't stringify, fetch automatically sets multipart/form-data when body is FormData
        // We actually need to make sure fetchApi doesn't set Content-Type: application/json for FormData
      });

      const newImageUrl = response.url; // from our uploads.controller.ts
      onChange([...images, newImageUrl]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  // The base URL for images. If fetchApi hits the Next.js proxy, we need to prepend API_URL if it returns a relative path
  // Our backend returns /uploads/filename.ext. We need to prefix it with NEXT_PUBLIC_API_URL or it will hit Next.js /uploads which doesn't exist.
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="flex flex-wrap gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative w-24 h-24 border rounded overflow-hidden group">
            <img 
              src={img} 
              alt="Uploaded" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:text-indigo-500 text-gray-500 transition-colors">
            {uploading ? (
              <span className="text-xs">Uploading...</span>
            ) : (
              <>
                <span className="text-2xl">+</span>
                <span className="text-xs mt-1">Upload</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
        {images.length < maxImages && (
          <button 
            type="button" 
            onClick={() => setIsGalleryOpen(true)}
            className="w-24 h-24 border-2 border-indigo-200 bg-indigo-50 rounded flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:text-indigo-700 text-indigo-500 transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-xs text-center leading-tight">Choose<br/>Gallery</span>
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400">Supported formats: JPG, PNG, GIF, WEBP.</p>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Choose from Media Gallery</h3>
              <button type="button" onClick={() => setIsGalleryOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {galleryImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (!images.includes(img)) {
                        onChange([...images, img]);
                        setIsGalleryOpen(false);
                      }
                    }}
                    className={`aspect-square relative rounded-lg overflow-hidden border-2 cursor-pointer shadow-sm group ${images.includes(img) ? 'border-indigo-500 opacity-50' : 'border-transparent hover:border-indigo-500'}`}
                  >
                    <Image 
                      src={img.startsWith('/') ? `https://api.instaimage.in${img}` : img} 
                      alt={`Gallery image ${idx}`} 
                      fill 
                      sizes="150px" 
                      className="object-cover group-hover:scale-105 transition-transform" 
                    />
                    {images.includes(img) && (
                      <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button type="button" onClick={() => setIsGalleryOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
