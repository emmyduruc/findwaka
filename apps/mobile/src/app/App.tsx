import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { LatLng } from '@findwaka/shared';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect } from 'react';

export default function App() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // comment out for now until firebase key is ready
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
  };
  return (
    <View className="flex-1 items-center justify-center bg-red-500 p-4">
      <Text className="text-2xl font-bold mb-4 text-blue-600">FindWaka Mobile</Text>
      <Text className="text-lg mb-2">
        Auth Status: Signed Out
      </Text>

      <TouchableOpacity
        onPress={getLocation}
        className="bg-blue-500 px-4 py-2 rounded-lg mt-4"
      >
        <Text className="text-white font-bold">Get Location</Text>
      </TouchableOpacity>

      {location && (
        <Text className="mt-4 text-gray-700">
          Coords: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </Text>
      )}
      {errorMsg && <Text className="text-red-500 mt-4">{errorMsg}</Text>}
    </View>
  );
}
