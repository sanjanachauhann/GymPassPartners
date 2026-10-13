import { useEffect, useState } from "react";

import { Text, TouchableOpacity, View } from "react-native";

import MapView, { Marker, Region } from "react-native-maps";

import * as Location from "expo-location";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocationStore } from "../store/locationStore";

export default function LocationPicker() {
  const { setLocation } = useLocationStore();

  const [region, setRegion] = useState<Region>({
    latitude: 19.076,
    longitude: 72.8777,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    })();
  }, []);

  const confirmLocation = async () => {
    const address = await Location.reverseGeocodeAsync({
      latitude: region.latitude,
      longitude: region.longitude,
    });

    let place = "Selected Location";

    if (address.length > 0) {
      const item = address[0];

      place = `${item.name || ""}, ${item.street || ""}, ${item.city || ""}, ${item.region || ""}`;
    }

    // SAVE LOCATION
    setLocation(place, region.latitude, region.longitude);

    await AsyncStorage.setItem(
      "selected_location",
      JSON.stringify({
        location: place,
        latitude: region.latitude,
        longitude: region.longitude,
      }),
    );

    // GO BACK
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
        />
      </MapView>

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 60,
          left: 20,
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* CONFIRM BUTTON */}
      <View
        style={{
          position: "absolute",
          bottom: 40,
          left: 20,
          right: 20,
        }}
      >
        <TouchableOpacity
          onPress={confirmLocation}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#23ee09",
            paddingVertical: 18,
            borderRadius: 22,

            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#050505",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Confirm Location
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
