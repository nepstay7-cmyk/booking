import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';
import { getUser, isAuthenticated } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);

      if (userData && userData.role === 'companyAdmin') {
        const statsResponse = await adminAPI.getStats();
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user || user.role !== 'companyAdmin') {
    return <div className="container mx-auto px-4 py-8">Unauthorized</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Total Properties</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalProperties}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Total Bookings</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-purple-600">NPR {stats.totalRevenue}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Pending Properties</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingProperties}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Pending Owners</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingOwners}</p>
          </div>
        </div>
      )}

      {/* Top Cities */}
      {stats && stats.topCities && stats.topCities.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Cities</h2>
          <div className="space-y-2">
            {stats.topCities.map((city, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{city.city}</span>
                <span className="font-bold">{city.count} properties</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/users"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <h3 className="text-xl font-bold mb-2">Manage Users</h3>
          <p className="text-gray-600">View and manage all users</p>
        </Link>
        <Link
          href="/admin/properties"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <h3 className="text-xl font-bold mb-2">Manage Properties</h3>
          <p className="text-gray-600">Approve and manage properties</p>
        </Link>
        <Link
          href="/admin/bookings"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <h3 className="text-xl font-bold mb-2">Manage Bookings</h3>
          <p className="text-gray-600">View all bookings</p>
        </Link>
      </div>
    </div>
  );
}




