'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/api';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images = [], onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
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
      </div>
      <p className="text-xs text-gray-400">Supported formats: JPG, PNG, GIF. Max 50MB.</p>
    </div>
  );
}
