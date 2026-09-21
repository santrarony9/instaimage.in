'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
      <p className="text-gray-600 mb-8 max-w-md">Something went wrong loading your dashboard. Your data is safe — please try again.</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition"
        >
          Try again
        </button>
        <Link href="/" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-bold hover:bg-gray-300 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}
