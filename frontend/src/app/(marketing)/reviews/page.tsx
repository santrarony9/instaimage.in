import { AggregateRatingJsonLd } from '@/components/seo/JsonLd';

export const metadata = {
  title: 'Customer Reviews & Testimonials | InstaImage',
  description: 'Read what our clients say about InstaImage photography, videography, and drone services.',
};

export default function ReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <AggregateRatingJsonLd ratingValue={4.9} reviewCount={420} itemName="InstaImage Photography Services" />
      <h1 className="text-4xl font-bold mb-12 text-center">Customer Reviews</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center mb-4">
              <div className="text-yellow-400 flex">{"★".repeat(5)}</div>
            </div>
            <p className="text-gray-600 mb-4 italic">"Absolutely amazing experience! The photos turned out better than we could have ever imagined. Highly recommend!"</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div>
                <p className="font-semibold text-sm">Customer {i}</p>
                <p className="text-gray-500 text-xs">Wedding Shoot</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
