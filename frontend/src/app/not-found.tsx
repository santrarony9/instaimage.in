import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h2 className="text-4xl font-black mb-4">404</h2>
      <p className="text-xl font-bold mb-2">Page Not Found</p>
      <p className="text-gray-600 mb-8 max-w-md">The page you are looking for does not exist or has been moved.</p>
      <Link
        href="/"
        className="bg-black text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider hover:bg-gray-800 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
