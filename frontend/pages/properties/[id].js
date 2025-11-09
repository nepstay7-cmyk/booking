import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { propertiesAPI, bookingsAPI, reviewsAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import Google Maps to avoid SSR issues
const GoogleMap = dynamic(() => import('@/components/GoogleMap'), { ssr: false });

export default function PropertyDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
    paymentMethod: 'cash',
  });

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchReviews();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await propertiesAPI.getById(id);
      setProperty(response.data.data);
    } catch (error) {
      toast.error('Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getByProperty(id);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error('Please login to book');
      router.push('/login');
      return;
    }

    try {
      const response = await bookingsAPI.create({
        property: id,
        ...bookingData,
      });
      
      toast.success('Booking created successfully!');
      
      // Redirect to payment if not cash
      if (bookingData.paymentMethod !== 'cash') {
        router.push(`/bookings/${response.data.data._id}/payment`);
      } else {
        router.push(`/bookings/${response.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!property) {
    return <div className="container mx-auto px-4 py-8">Property not found</div>;
  }

  const nights = bookingData.checkIn && bookingData.checkOut
    ? Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))
    : 0;
  const totalAmount = nights * property.pricePerNight * bookingData.rooms;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
      <p className="text-gray-600 mb-4">
        {property.address?.city}, {property.address?.district}, {property.address?.province}
      </p>

      {/* Images */}
      {property.images && property.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {property.images.map((image, index) => (
            <img
              key={index}
              src={image.url || '/placeholder-image.jpg'}
              alt={image.alt || property.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700">{property.description}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities?.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Google Map */}
          {property.location && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Location</h2>
              <GoogleMap
                latitude={property.location.latitude}
                longitude={property.location.longitude}
                propertyName={property.name}
              />
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <span className="font-bold">{review.user?.name}</span>
                      <span className="text-yellow-500 ml-2">
                        {'★'.repeat(review.rating)}
                      </span>
                    </div>
                    {review.title && (
                      <h3 className="font-semibold mb-1">{review.title}</h3>
                    )}
                    <p className="text-gray-700">{review.comment}</p>
                    {review.ownerReply && (
                      <div className="mt-2 pl-4 border-l-4 border-primary-500">
                        <p className="text-sm text-gray-600">
                          <strong>Owner Reply:</strong> {review.ownerReply.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary-600">
                NPR {property.pricePerNight}
              </span>
              <span className="text-gray-600"> / night</span>
            </div>
            <div className="mb-4">
              <span className="text-yellow-500">
                {'★'.repeat(Math.floor(property.rating?.average || 0))}
              </span>
              <span className="text-gray-600 ml-2">
                {property.rating?.average?.toFixed(1) || '0.0'} ({property.rating?.count || 0} reviews)
              </span>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bookingData.checkIn}
                  onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bookingData.checkOut}
                  onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max={property.maxGuests}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rooms
                </label>
                <input
                  type="number"
                  min="1"
                  max={property.rooms?.total}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bookingData.rooms}
                  onChange={(e) => setBookingData({ ...bookingData, rooms: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bookingData.paymentMethod}
                  onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                >
                  <option value="cash">Cash on Arrival</option>
                  <option value="khalti">Khalti</option>
                  <option value="esewa">eSewa</option>
                  <option value="stripe">Stripe (Card)</option>
                </select>
              </div>

              {nights > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>NPR {property.pricePerNight} × {nights} nights × {bookingData.rooms} rooms</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>NPR {totalAmount}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded hover:bg-primary-700 font-bold"
              >
                Book Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}




