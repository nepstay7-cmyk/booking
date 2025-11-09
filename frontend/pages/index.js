import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { propertiesAPI } from '@/lib/api';

export default function Home({ featuredProperties }) {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.city) params.append('city', searchParams.city);
    if (searchParams.checkIn) params.append('checkIn', searchParams.checkIn);
    if (searchParams.checkOut) params.append('checkOut', searchParams.checkOut);
    if (searchParams.guests) params.append('maxGuests', searchParams.guests);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Places in Nepal
          </h1>
          <p className="text-xl mb-8">
            Book hotels and hostels across Nepal for students and tourists
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Kathmandu, Pokhara..."
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  value={searchParams.city}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, city: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  value={searchParams.checkIn}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, checkIn: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  value={searchParams.checkOut}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, checkOut: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Guests
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  value={searchParams.guests}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, guests: e.target.value })
                  }
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-primary-600 text-white py-3 rounded hover:bg-primary-700 font-bold"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties?.data && featuredProperties.data.length > 0 ? (
              featuredProperties.data.slice(0, 6).map((property) => (
              <Link
                key={property._id}
                href={`/properties/${property._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {property.images && property.images[0] && (
                  <img
                    src={property.images[0].url || '/placeholder-image.jpg'}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{property.name}</h3>
                  <p className="text-gray-600 mb-2">
                    {property.address?.city}, {property.address?.district}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-bold">
                      NPR {property.pricePerNight}/night
                    </span>
                    <span className="text-yellow-500">
                      ★ {property.rating?.average?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              </Link>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-600 py-8">
                No properties available at the moment. Please check back later.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Kathmandu', 'Pokhara', 'Chitwan', 'Lumbini'].map((city) => (
              <Link
                key={city}
                href={`/search?city=${city}`}
                className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold">{city}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_URL}/properties?limit=6&sort=rating.average&order=desc`, {
      signal: controller.signal,
    }).catch(() => null);
    
    clearTimeout(timeoutId);
    
    if (!response || !response.ok) {
      return {
        props: {
          featuredProperties: { data: [] },
        },
      };
    }
    
    const data = await response.json();
    return {
      props: {
        featuredProperties: data || { data: [] },
      },
    };
  } catch (error) {
    // Return empty data if API is not available (e.g., during development)
    return {
      props: {
        featuredProperties: { data: [] },
      },
    };
  }
}

