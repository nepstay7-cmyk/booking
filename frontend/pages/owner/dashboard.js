import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { propertiesAPI, bookingsAPI, usersAPI } from '@/lib/api';
import { getUser, isAuthenticated } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
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

      if (userData && (userData.role === 'propertyOwner' || userData.role === 'companyAdmin')) {
        const propertiesResponse = await propertiesAPI.getMyProperties();
        setProperties(propertiesResponse.data.data || []);

        const bookingsResponse = await bookingsAPI.getAll();
        setBookings(bookingsResponse.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await bookingsAPI.updateStatus(bookingId, { status });
      toast.success('Booking status updated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user || (user.role !== 'propertyOwner' && user.role !== 'companyAdmin')) {
    return <div className="container mx-auto px-4 py-8">Unauthorized</div>;
  }

  // Calculate stats
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'completed' && b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Owner Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Total Properties</p>
          <p className="text-3xl font-bold text-primary-600">{properties.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">NPR {totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Pending Bookings</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Confirmed Bookings</p>
          <p className="text-3xl font-bold text-green-600">{confirmedBookings}</p>
        </div>
      </div>

      {/* Properties */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Properties</h2>
          <Link
            href="/owner/properties/new"
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Add Property
          </Link>
        </div>
        {properties.length === 0 ? (
          <p className="text-gray-600">No properties yet</p>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property._id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-bold">{property.name}</h3>
                  <p className="text-gray-600">
                    {property.address?.city}, {property.address?.district}
                  </p>
                  <p className="text-gray-600">
                    Status: {property.isApproved ? 'Approved' : 'Pending Approval'}
                  </p>
                </div>
                <Link
                  href={`/owner/properties/${property._id}`}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Bookings</h2>
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
                    <h3 className="text-xl font-bold">{booking.property?.name}</h3>
                    <p className="text-gray-600">
                      Guest: {booking.user?.name} ({booking.user?.email})
                    </p>
                    <p className="text-gray-600">
                      Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Check-out: {new Date(booking.checkOut).toLocaleDateString()}
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
                    {booking.status === 'pending' && (
                      <div className="mt-2 space-y-2">
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                          className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                          className="block w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </div>
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




