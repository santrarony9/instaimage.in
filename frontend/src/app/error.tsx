'use client';

import { useEffect } from 'react';

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
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-8 max-w-md">We encountered an unexpected error. Please try again or contact support if the issue persists.</p>
      <button
        onClick={() => reset()}
        className="bg-black text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider hover:bg-gray-800 transition"
      >
        Try again
      </button>
    </div>
  );
}
