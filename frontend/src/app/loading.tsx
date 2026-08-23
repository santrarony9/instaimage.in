export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
      <p className="text-gray-500 font-medium">Loading InstaImage...</p>
    </div>
  );
}
