import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { bookingsAPI, usersAPI } from '@/lib/api';
import { getUser, isAuthenticated } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
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

      if (userData && userData.role === 'user') {
        const bookingsResponse = await bookingsAPI.getAll();
        setBookings(bookingsResponse.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsAPI.cancel(bookingId, { reason: 'Cancelled by user' });
      toast.success('Booking cancelled successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user || user.role !== 'user') {
    return <div className="container mx-auto px-4 py-8">Unauthorized</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      {/* User Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="text-lg font-semibold">{user.phone || 'Not provided'}</p>
          </div>
        </div>
        <Link
          href="/user/profile"
          className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Edit Profile
        </Link>
      </div>

      {/* Bookings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-600">No bookings yet</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">
                      {booking.property?.name || 'Property'}
                    </h3>
                    <p className="text-gray-600">
                      {booking.property?.address?.city}, {booking.property?.address?.district}
                    </p>
                    <p className="text-gray-600 mt-2">
                      Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Guests: {booking.guests} | Rooms: {booking.rooms}
                    </p>
                    <p className="text-lg font-bold text-primary-600 mt-2">
                      Total: NPR {booking.totalAmount}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="mt-2 block w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




