export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
          Open New Ticket
        </button>
      </div>

      <div className="bg-white shadow rounded-md p-12 text-center border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">No support tickets</h3>
        <p className="mt-2 text-sm text-gray-500">
          If you need help with a booking or your account, you can open a support ticket here.
        </p>
      </div>
    </div>
  );
}
