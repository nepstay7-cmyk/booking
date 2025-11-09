export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Nepal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Welcome to Nepal</h2>
          <p className="text-gray-700 mb-4">
            Nepal is a landlocked country in South Asia, known for its stunning Himalayan mountains,
            rich cultural heritage, and warm hospitality. From the bustling streets of Kathmandu to
            the serene lakes of Pokhara, Nepal offers diverse experiences for every traveler.
          </p>
          <p className="text-gray-700">
            Whether you're a student looking for affordable accommodation or a tourist exploring
            ancient temples and trekking routes, Nepal has something special for everyone.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Popular Destinations</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-primary-600 mr-2">✓</span>
              <span><strong>Kathmandu:</strong> Capital city with rich history and culture</span>
            </li>
            <li className="flex items-center">
              <span className="text-primary-600 mr-2">✓</span>
              <span><strong>Pokhara:</strong> Gateway to the Annapurna region</span>
            </li>
            <li className="flex items-center">
              <span className="text-primary-600 mr-2">✓</span>
              <span><strong>Chitwan:</strong> National park and wildlife sanctuary</span>
            </li>
            <li className="flex items-center">
              <span className="text-primary-600 mr-2">✓</span>
              <span><strong>Lumbini:</strong> Birthplace of Lord Buddha</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Travel Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">Best Time to Visit</h3>
            <p className="text-gray-700">
              The best time to visit Nepal is during the dry seasons: October to November and
              March to May. These months offer clear skies and pleasant weather for trekking and
              sightseeing.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Currency</h3>
            <p className="text-gray-700">
              The official currency is the Nepalese Rupee (NPR). Most hotels and restaurants
              accept major credit cards, and ATMs are widely available in cities.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Language</h3>
            <p className="text-gray-700">
              Nepali is the official language, but English is widely spoken in tourist areas,
              hotels, and restaurants.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Visa</h3>
            <p className="text-gray-700">
              Most visitors can obtain a visa on arrival at Tribhuvan International Airport in
              Kathmandu. Check current visa requirements before traveling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




