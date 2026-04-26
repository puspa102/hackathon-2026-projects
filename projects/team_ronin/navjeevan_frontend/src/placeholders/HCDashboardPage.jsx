import { Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function HCDashboardPage() {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.full_name || user?.fullName || 'Healthcare Staff';

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-xl border-t-4 border-green-600 bg-white p-8 shadow-md">
        <div className="mb-4 flex items-center gap-2 text-green-600">
          <Building2 size={22} />
          <h1 className="text-2xl font-bold">Healthcare Dashboard</h1>
        </div>
        <p className="text-gray-700">
          Welcome, {displayName}! Healthcare portal coming soon. 🏥
        </p>

        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
