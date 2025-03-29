'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Clock, Navigation, Star, Phone, MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '70vh'
};

const defaultCenter = {
  lat: 55.7558, // Измените на координаты вашего города
  lng: 37.6173
};

interface Restaurant {
  name: string;
  position: google.maps.LatLngLiteral;
  address: string;
  distance?: number; // в метрах
  duration?: number; // в секундах
  rating?: number;
  phone?: string;
}

export default function RestaurantsPage() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [distanceMatrix, setDistanceMatrix] = useState<google.maps.DistanceMatrixService | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places']
  });

  // Изменим функцию getDeliveryInfo
  const getDeliveryInfo = async (
    origin: google.maps.LatLngLiteral,
    destinations: google.maps.LatLngLiteral[]
  ) => {
    try {
      const matrix = new google.maps.DistanceMatrixService();
      const response = await matrix.getDistanceMatrix({
        origins: [origin],
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      });

      return response.rows[0].elements;
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      return null;
    }
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds(defaultCenter);
    map.fitBounds(bounds);
    setMap(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          map.setCenter(userPos);

          const service = new google.maps.places.PlacesService(map);

          try {
            service.nearbySearch(
              {
                location: userPos,
                radius: 5000,
                type: 'restaurant'
              },
              async (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  // Сначала установим базовый список ресторанов
                  const basicRestaurantList = results.map(place => ({
                    name: place.name!,
                    position: {
                      lat: place.geometry!.location!.lat(),
                      lng: place.geometry!.location!.lng()
                    },
                    address: place.vicinity!,
                    rating: place.rating
                  }));

                  // Устанавливаем рестораны сразу, чтобы они появились на карте
                  setRestaurants(basicRestaurantList);

                  // Затем получаем дополнительную информацию о расстояниях
                  try {
                    const destinations = basicRestaurantList.map(r => r.position);
                    const distanceResults = await getDeliveryInfo(userPos, destinations);

                    if (distanceResults) {
                      const updatedRestaurants = basicRestaurantList.map((restaurant, index) => ({
                        ...restaurant,
                        distance: distanceResults[index].distance?.value,
                        duration: distanceResults[index].duration?.value
                      }));

                      const sortedRestaurants = updatedRestaurants.sort((a, b) =>
                        (a.duration || 0) - (b.duration || 0)
                      );

                      setRestaurants(sortedRestaurants);
                    }
                  } catch (error) {
                    console.error('Error updating restaurants with distance info:', error);
                    // Базовый список ресторанов уже отображается, так что пользователь все равно что-то видит
                  }
                }
              }
            );
          } catch (error) {
            console.error('Error in nearbySearch:', error);
            alert('Ошибка при поиске ресторанов');
          }
        },
        () => {
          alert('Ошибка при определении местоположения');
        }
      );
    }
  }, []);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Нет данных';
    const minutes = Math.round(seconds / 60);
    return `${minutes} мин`;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return 'Нет данных';
    return `${(meters / 1000).toFixed(1)} км`;
  };

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Найти ближайшие рестораны</h1>
        <p className="text-gray-600">Время доставки рассчитано с учетом текущего трафика</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden shadow-lg bg-white">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={userLocation || defaultCenter}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: true,
                mapTypeControl: true,
              }}
            >
              {userLocation && (
                <>
                  <Marker
                    position={userLocation}
                    icon={{
                      url: '/chelovechek.png',
                      scaledSize: new window.google.maps.Size(60, 60)
                    }}
                  />
                  <Circle
                    center={userLocation}
                    radius={5000}
                    options={{
                      fillColor: '#ff8c0033',
                      fillOpacity: 0.2,
                      strokeColor: '#ff8c00',
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                </>
              )}

              {restaurants.map((restaurant, index) => (
                <Marker
                  key={index}
                  position={restaurant.position}
                  onClick={() => setSelectedRestaurant(restaurant)}
                />
              ))}

              {selectedRestaurant && (
                <InfoWindow
                  position={selectedRestaurant.position}
                  onCloseClick={() => setSelectedRestaurant(null)}
                >
                  <div className="p-3">
                    <h3 className="font-semibold text-lg mb-2">{selectedRestaurant.name}</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{selectedRestaurant.address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>Время доставки: {formatDuration(selectedRestaurant.duration)}</span>
                      </p>
                      {selectedRestaurant.rating && (
                        <p className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-orange-500" />
                          <span>Рейтинг: {selectedRestaurant.rating}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Ближайшие рестораны</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {restaurants.map((restaurant, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all cursor-pointer
                    ${selectedRestaurant?.name === restaurant.name
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'}`}
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    map?.panTo(restaurant.position);
                  }}
                >
                  <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-orange-500" />
                      <span>{formatDistance(restaurant.distance)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Время доставки: {formatDuration(restaurant.duration)}</span>
                    </p>
                    {restaurant.rating && (
                      <p className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-orange-500" />
                        <span>{restaurant.rating}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>{restaurant.address}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 