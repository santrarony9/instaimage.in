export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
      <div className="bg-white shadow rounded-md p-12 text-center border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">No reviews written</h3>
        <p className="mt-2 text-sm text-gray-500">
          You can write reviews for completed shoots. None are available right now.
        </p>
      </div>
    </div>
  );
}
