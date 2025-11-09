import { useEffect, useRef } from 'react';

export default function GoogleMap({ latitude, longitude, propertyName }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    };

    const initializeMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: propertyName,
      });
    };

    loadGoogleMaps();
  }, [latitude, longitude, propertyName]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '400px' }}
      className="rounded-lg"
    />
  );
}




