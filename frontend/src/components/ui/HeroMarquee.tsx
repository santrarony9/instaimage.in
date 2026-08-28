import Image from 'next/image';

export function HeroMarquee({ images }: { images: string[] }) {
  // We need enough images to fill the screen twice so we can slide continuously
  // 3 rows with different subsets or shuffled versions of the images.
  // Ensure we have at least 15-20 images per row to make the marquee look full.
  
  const createRowImages = (seed: number) => {
    let row = [...images];
    // Rotate the array based on seed to make rows look different
    for (let i = 0; i < seed; i++) {
      const el = row.shift();
      if (el) row.push(el);
    }
    // Duplicate the row to ensure smooth infinite scrolling
    // If there are few images, duplicate it multiple times
    while (row.length < 15) {
      row = [...row, ...row];
    }
    // We append the same array at the end so the transform: translateX(-50%) seamlessly loops
    return [...row, ...row];
  };

  const row1 = createRowImages(0);
  const row2 = createRowImages(images.length > 3 ? 3 : 1);
  const row3 = createRowImages(images.length > 6 ? 6 : 2);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black opacity-30 rotate-[-4deg] scale-110">
      <div className="flex flex-col gap-4 pt-10">
        
        {/* Row 1: Left */}
        <div className="flex whitespace-nowrap animate-marquee-left w-max">
          {row1.map((src, i) => (
            <div key={i} className="relative w-48 h-36 md:w-64 md:h-48 rounded-xl overflow-hidden mx-2 flex-shrink-0 bg-gray-800 shadow-xl">
              <Image 
                src={src} 
                alt="Portfolio" 
                fill 
                sizes="(max-width: 768px) 192px, 256px"
                className="object-cover" 
              />
            </div>
          ))}
        </div>

        {/* Row 2: Right */}
        <div className="flex whitespace-nowrap animate-marquee-right w-max ml-[-20%]">
          {row2.map((src, i) => (
            <div key={i} className="relative w-48 h-36 md:w-64 md:h-48 rounded-xl overflow-hidden mx-2 flex-shrink-0 bg-gray-800 shadow-xl">
              <Image 
                src={src} 
                alt="Portfolio" 
                fill 
                sizes="(max-width: 768px) 192px, 256px"
                className="object-cover" 
              />
            </div>
          ))}
        </div>

        {/* Row 3: Left */}
        <div className="flex whitespace-nowrap animate-marquee-left w-max ml-[10%]">
          {row3.map((src, i) => (
            <div key={i} className="relative w-48 h-36 md:w-64 md:h-48 rounded-xl overflow-hidden mx-2 flex-shrink-0 bg-gray-800 shadow-xl">
              <Image 
                src={src} 
                alt="Portfolio" 
                fill 
                sizes="(max-width: 768px) 192px, 256px"
                className="object-cover" 
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
