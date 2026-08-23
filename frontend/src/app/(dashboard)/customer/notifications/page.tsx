export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>

      <div className="bg-white shadow rounded-md p-12 text-center border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">You're all caught up!</h3>
        <p className="mt-2 text-sm text-gray-500">
          You don't have any new notifications.
        </p>
      </div>
    </div>
  );
}
