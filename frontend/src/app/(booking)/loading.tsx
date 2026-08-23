export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 animate-pulse">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border h-64">
             <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
             <div className="space-y-3">
               <div className="h-4 bg-gray-200 rounded w-full"></div>
               <div className="h-4 bg-gray-200 rounded w-3/4"></div>
               <div className="h-4 bg-gray-200 rounded w-5/6"></div>
             </div>
          </div>
        </div>

        <div className="flex justify-between mt-12 border-t pt-6">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
