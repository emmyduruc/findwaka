import React, { useEffect, useRef, useState } from 'react';
import { MapPin, List, Grid, Bike, Truck, Car, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { useDriverStore } from '../stores/driver';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';
import { VehicleType } from '@waka/shared';
import { initGoogleMaps, getCurrentLocation } from '../services/maps';

export const NearbyDriversPage: React.FC = () => {
  const {
    nearbyDrivers,
    filteredDrivers,
    isLoading,
    vehicleFilter,
    viewMode,
    userLocation,
    fetchNearbyDrivers,
    setVehicleFilter,
    setViewMode,
    updateUserLocation,
  } = useDriverStore();

  const { authStatus } = useAuthStore();
  const { setSignInModalOpen, setSelectedDriver } = useUIStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await initGoogleMaps();
        await updateUserLocation();
        await fetchNearbyDrivers();
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (mapRef.current && window.google && nearbyDrivers.length > 0) {
      const center = userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : nearbyDrivers[0]?.lastLat && nearbyDrivers[0]?.lastLng
        ? { lat: nearbyDrivers[0].lastLat, lng: nearbyDrivers[0].lastLng }
        : { lat: 6.5244, lng: 3.3792 }; // Default to Lagos

      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#111827' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#94A3B8' }],
          },
        ],
      });

      // Add user location marker
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map: newMap,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#6EE7FF',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          title: 'Your Location',
        });
      }

      // Add driver markers
      const newMarkers = nearbyDrivers
        .filter((driver) => driver.lastLat && driver.lastLng)
        .map((driver) => {
          const marker = new window.google.maps.Marker({
            position: { lat: driver.lastLat!, lng: driver.lastLng! },
            map: newMap,
            title: driver.displayName,
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="color: #F8FAFC; padding: 8px;">
                <strong>${driver.displayName}</strong><br/>
                ${driver.vehicleType} - ${driver.vehicleBrand}<br/>
                ${driver.distanceText || 'Distance unknown'}
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(newMap, marker);
          });

          return marker;
        });

      setMap(newMap);
      setMarkers(newMarkers);
    }
  }, [nearbyDrivers, userLocation]);

  const handleContactDriver = (driver: any) => {
    if (authStatus === 'guest') {
      setSignInModalOpen(true);
      return;
    }
    setSelectedDriver(driver);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const vehicleIcons = {
    [VehicleType.BIKE]: Bike,
    [VehicleType.TRICYCLE]: Truck,
    [VehicleType.CAR]: Car,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-textPrimary">Nearby Drivers</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} className="mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapPin size={16} className="mr-2" />
                Map
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'bike', 'tricycle', 'car'] as const).map((filter) => (
              <Button
                key={filter}
                variant={vehicleFilter === filter ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setVehicleFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="h-[calc(100vh-180px)]">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-textMuted">Loading drivers...</p>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-textMuted">No drivers found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => {
                const VehicleIcon = vehicleIcons[driver.vehicleType];
                return (
                  <Card key={driver.id} variant="elevated" className="hover:border-accentPrimary/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={driver.photoUrl} name={driver.displayName} size="lg" />
                        <div>
                          <h3 className="font-semibold text-textPrimary">{driver.displayName}</h3>
                          <p className="text-sm text-textMuted">{driver.communityHome}</p>
                        </div>
                      </div>
                      {driver.isOnline && (
                        <span className="w-3 h-3 bg-success rounded-full" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <VehicleIcon size={20} className="text-accentPrimary" />
                      <span className="text-textMuted">
                        {driver.vehicleType} - {driver.vehicleBrand} ({driver.vehicleColor})
                      </span>
                    </div>

                    {driver.distanceText && (
                      <p className="text-sm text-textMuted mb-4 flex items-center gap-1">
                        <MapPin size={14} />
                        {driver.distanceText}
                      </p>
                    )}

                    {driver.averageRating > 0 && (
                      <p className="text-sm text-textMuted mb-4">
                        ⭐ {driver.averageRating.toFixed(1)} ({driver.ratingCount} reviews)
                      </p>
                    )}

                    <div className="flex gap-2">
                      {authStatus === 'loggedIn' && driver.phone ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCall(driver.phone!)}
                            className="flex-1"
                          >
                            <Phone size={16} className="mr-2" />
                            Call
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWhatsApp(driver.phone!)}
                            className="flex-1"
                          >
                            <ExternalLink size={16} className="mr-2" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleContactDriver(driver)}
                            className="flex-1"
                          >
                            <MessageCircle size={16} className="mr-2" />
                            Chat
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleContactDriver(driver)}
                          className="w-full"
                        >
                          {authStatus === 'guest' ? 'Sign In to Contact' : 'Contact Driver'}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

