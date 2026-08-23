import Image from 'next/image';

export default function GalleryPage() {
  // Mock data for the gallery
  const photos = [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
    'https://images.unsplash.com/photo-1519741497674-611481863552',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74',
    'https://images.unsplash.com/photo-1475721028070-2051152ca712'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Photo Gallery</h1>
        <button className="bg-black text-white px-4 py-2 rounded shadow text-sm hover:bg-gray-800 transition">
          Download All (ZIP)
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((url, i) => (
          <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
            <Image 
              src={url + '?w=800&q=80'} 
              alt={`Gallery Image ${i + 1}`} 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={i < 3}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <button className="bg-white text-black text-sm px-4 py-2 rounded font-medium shadow w-max hover:bg-gray-100">
                Download HD
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
