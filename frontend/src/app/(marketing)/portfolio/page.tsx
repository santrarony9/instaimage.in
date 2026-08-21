export const metadata = {
  title: 'Photography Portfolio | InstaImage',
  description: 'Explore our curated portfolio of stunning wedding, corporate, and event photography projects by top InstaImage professionals.',
};

export default function PortfolioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold mb-12 text-center">Our Portfolio</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-md overflow-hidden flex items-center justify-center relative group">
            <span className="text-gray-400">Image {i}</span>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 font-medium">View Project</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
