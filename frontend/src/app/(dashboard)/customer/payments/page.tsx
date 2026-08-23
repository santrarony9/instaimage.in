export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments & Invoices</h1>
      <div className="bg-white shadow rounded-md p-12 text-center border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">No payment history</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your payment history and invoices will appear here once you make a booking.
        </p>
      </div>
    </div>
  );
}
