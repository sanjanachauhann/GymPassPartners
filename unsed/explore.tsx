import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  DimensionValue,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocationStore } from "../store/locationStore";

type PlaceSuggestion = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type Gym = {
  id: string;
  gymName: string;
  address: string;
  rating?: number;
  placeId: string;
  distanceKm?: number;
  dailyPrice?: number;
  isOpen?: boolean;
  photos?: string[];
};

type SavedLocation = {
  location: string;
  latitude: number;
  longitude: number;
};

const GOOGLE_PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  Constants.expoConfig?.extra?.googleMapsApiKey;

const getRadiusValue = (distance: string) =>
  Number(distance.replace(" KM", ""));

const formatDistance = (distanceKm?: number | null) => {
  if (typeof distanceKm !== "number") {
    return "Nearby";
  }

  return `${distanceKm.toFixed(1)} km away`;
};

const readSavedLocation = async () => {
  const savedLocation = await AsyncStorage.getItem("selected_location");

  if (!savedLocation) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedLocation);

    if (
      typeof parsed.location === "string" &&
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number"
    ) {
      return parsed as SavedLocation;
    }
  } catch {
    return null;
  }

  return null;
};

export default function Explore() {
  const [selectedDistance, setSelectedDistance] = useState("1.5 KM");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [gymsNearby, setGymsNearby] = useState<Gym[]>([]);
  const [isLoadingGyms, setIsLoadingGyms] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

  const { latitude, longitude, setLocation } = useLocationStore();

  const openGymDetails = (gym: Gym) => {
    console.log(gym.photos);
    router.push({
      pathname: "/createpass",
      params: {
        placeId: gym.placeId,
        gymName: gym.gymName,
        gymAddress: gym.address,
        gymRating: gym.rating,
        rating: gym.rating,
        photos: gym.photos,
      },
    });
  };
  const getDistanceBarWidth = (distance: string): DimensionValue => {
    const distances = ["0.5 KM", "1 KM", "1.5 KM", "3 KM", "5 KM", "10 KM"];
    const index = distances.indexOf(distance);
    if (index === -1) return "0%";
    return `${((index + 1) / distances.length) * 100}%`;
  };

  const filteredGyms = gymsNearby.filter((gym) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    const gymName = gym.gymName || "";
    const address = gym.address || "";

    return (
      gymName.toLowerCase().includes(normalizedQuery) ||
      address.toLowerCase().includes(normalizedQuery)
    );
  });

  const loadNearbyGyms = useCallback(async () => {
    if (!latitude || !longitude || !GOOGLE_PLACES_API_KEY) {
      setGymsNearby([]);
      return;
    }

    try {
      setIsLoadingGyms(true);

      const radiusInMeters = getRadiusValue(selectedDistance) * 1000;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusInMeters}&type=gym&key=${GOOGLE_PLACES_API_KEY}`,
      );

      const data = await response.json();

      console.log("Google gyms:", data);

      const gyms =
        data.results?.map((place: any) => ({
          id: place.place_id,
          placeId: place.place_id,
          gymName: place.name,
          address: place.vicinity,
          rating: place.rating,
          isOpen: place.opening_hours?.open_now,
          dailyPrice: 199, // temporary until you connect your DB
        })) || [];
      setGymsNearby(gyms);
    } catch (error) {
      // console.log("Failed to fetch gyms:", error);
      setGymsNearby([]);
    } finally {
      setIsLoadingGyms(false);
    }
  }, [latitude, longitude, selectedDistance]);

  useEffect(() => {
    loadNearbyGyms();
  }, [loadNearbyGyms]);

  useFocusEffect(
    useCallback(() => {
      loadNearbyGyms();
    }, [loadNearbyGyms]),
  );

  useEffect(() => {
    const loadSavedLocation = async () => {
      if (latitude && longitude) {
        return;
      }

      const savedLocation = await readSavedLocation();

      if (savedLocation) {
        setLocation(
          savedLocation.location,
          savedLocation.latitude,
          savedLocation.longitude,
        );
      }
    };

    loadSavedLocation();
  }, [latitude, longitude, setLocation]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    if (!GOOGLE_PLACES_API_KEY) {
      setSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    setIsSearchingPlaces(true);

    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          input: trimmedQuery,
          key: GOOGLE_PLACES_API_KEY,
          types: "geocode",
          components: "country:in",
        });

        if (latitude && longitude) {
          params.append("location", `${latitude},${longitude}`);
          params.append("radius", "50000");
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
        );
        const data = await response.json();

        setSuggestions(Array.isArray(data.predictions) ? data.predictions : []);
      } catch (error) {
        // console.log(error);
        setSuggestions([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [latitude, longitude, searchQuery]);

  const selectSuggestion = async (suggestion: PlaceSuggestion) => {
    setSearchQuery(suggestion.description);
    setSuggestions([]);
    setIsSuggestionsVisible(false);

    if (!GOOGLE_PLACES_API_KEY) {
      return;
    }

    try {
      const params = new URLSearchParams({
        place_id: suggestion.place_id,
        key: GOOGLE_PLACES_API_KEY,
        fields: "formatted_address,geometry",
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
      );
      const data = await response.json();
      const selectedLocation = data.result;
      const selectedLatitude = selectedLocation?.geometry?.location?.lat;
      const selectedLongitude = selectedLocation?.geometry?.location?.lng;
      const selectedAddress =
        selectedLocation?.formatted_address || suggestion.description;

      if (
        typeof selectedAddress === "string" &&
        typeof selectedLatitude === "number" &&
        typeof selectedLongitude === "number"
      ) {
        setSearchQuery("");
        setLocation(selectedAddress, selectedLatitude, selectedLongitude);

        await AsyncStorage.setItem(
          "selected_location",
          JSON.stringify({
            location: selectedAddress,
            latitude: selectedLatitude,
            longitude: selectedLongitude,
          }),
        );
      }
    } catch (error) {
      // console.log(error);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#050505",
      }}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView style={{ paddingHorizontal: 20 }}>
        {/* HEADER */}
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              color: "white",
              fontSize: 34,
              fontWeight: "bold",
            }}
          >
            Explore
          </Text>

          <Text
            style={{
              color: "#777",
              marginTop: 8,
              fontSize: 15,
            }}
          >
            Find gyms near your location
          </Text>
        </View>

        <View
          style={{
            marginTop: 28,
          }}
        >
          <View
            style={{
              backgroundColor: "#0F0F0F",
              borderRadius: 22,
              paddingHorizontal: 18,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: isSuggestionsVisible
                ? "rgba(0,245,212,0.3)"
                : "rgba(255,255,255,0.05)",
            }}
          >
            <Ionicons
              name="search"
              size={22}
              color={isSuggestionsVisible ? "#23ee09" : "#777"}
            />

            <TextInput
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setIsSuggestionsVisible(true);
              }}
              onFocus={() => setIsSuggestionsVisible(true)}
              onSubmitEditing={() => setIsSuggestionsVisible(false)}
              returnKeyType="search"
              placeholder="Search gym or area..."
              placeholderTextColor="#777"
              style={{
                flex: 1,
                color: "white",
                marginLeft: 12,
                fontSize: 16,
              }}
            />

            {isSearchingPlaces ? (
              <ActivityIndicator size="small" color="#23ee09" />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={22} color="#777" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsSuggestionsVisible(false)}>
                <Ionicons name="options-outline" size={22} color="#23ee09" />
              </TouchableOpacity>
            )}
          </View>

          {isSuggestionsVisible && searchQuery.trim().length >= 2 && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: "#0D0D0D",
                borderRadius: 22,
                borderWidth: 1,
                borderColor: "rgba(0,245,212,0.14)",
                overflow: "hidden",
              }}
            >
              {!GOOGLE_PLACES_API_KEY ? (
                <Text
                  style={{
                    color: "#777",
                    padding: 18,
                    fontSize: 14,
                  }}
                >
                  Add Google API to enable suggestions.
                </Text>
              ) : suggestions.length > 0 ? (
                <>
                  {suggestions.map((suggestion, index) => {
                    const mainText =
                      suggestion.structured_formatting?.main_text ||
                      suggestion.description;
                    const secondaryText =
                      suggestion.structured_formatting?.secondary_text;

                    return (
                      <TouchableOpacity
                        key={suggestion.place_id}
                        onPress={() => selectSuggestion(suggestion)}
                        activeOpacity={0.82}
                        style={{
                          paddingHorizontal: 18,
                          paddingVertical: 15,
                          flexDirection: "row",
                          alignItems: "center",
                          borderBottomWidth:
                            index === suggestions.length - 1 ? 0 : 1,
                          borderBottomColor: "rgba(255,255,255,0.06)",
                        }}
                      >
                        <View
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            backgroundColor: "rgba(0,245,212,0.1)",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name="location" size={17} color="#23ee09" />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: "white",
                              fontSize: 15,
                              fontWeight: "600",
                            }}
                          >
                            {mainText}
                          </Text>

                          {secondaryText ? (
                            <Text
                              numberOfLines={1}
                              style={{
                                color: "#777",
                                marginTop: 4,
                                fontSize: 13,
                              }}
                            >
                              {secondaryText}
                            </Text>
                          ) : null}
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#444"
                        />
                      </TouchableOpacity>
                    );
                  })}

                  <Text
                    style={{
                      color: "#555",
                      fontSize: 11,
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      textAlign: "right",
                    }}
                  >
                    Powered by Google
                  </Text>
                </>
              ) : !isSearchingPlaces ? (
                <Text
                  style={{
                    color: "#777",
                    padding: 18,
                    fontSize: 14,
                  }}
                >
                  No address suggestions found.
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* DISTANCE FILTER */}
        <View style={{ marginTop: 30 }}>
          {/* TOP TEXT */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Distance Radius
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "rgba(0,245,212,0.12)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: "#23ee09",
                  fontWeight: "600",
                }}
              >
                {selectedDistance}
              </Text>
            </TouchableOpacity>
          </View>

          {/* DISTANCE BAR */}
          <View
            style={{
              marginTop: 20,
              height: 6,
              backgroundColor: "#151515",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <View
              // style={{
              //   width: getDistanceBarWidth(selectedDistance),
              //   height: "100%",
              //   backgroundColor: "#23ee09",
              //   borderRadius: 10,
              // }}
              style={{
                width: getDistanceBarWidth(selectedDistance),
                height: "100%",
                backgroundColor: "#23ee09",
                borderRadius: 10,
                transitionDuration: "300ms", // works on web only
              }}
            />
          </View>

          {/* DISTANCE OPTIONS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 20 }}
          >
            {["0.5 KM", "1 KM", "1.5 KM", "3 KM", "5 KM", "10 KM"].map(
              (item, index) => {
                const isSelected = selectedDistance === item;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedDistance(item)}
                    activeOpacity={0.85}
                    style={{
                      marginRight: 12,
                      backgroundColor: isSelected ? "#23ee09" : "#111",

                      paddingHorizontal: 18,
                      paddingVertical: 12,

                      borderRadius: 18,

                      borderWidth: 1,
                      borderColor: isSelected
                        ? "#23ee09"
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#050505" : "white",

                        fontWeight: "600",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </ScrollView>
        </View>

        {/* SECTION TITLE */}
        <View
          style={{
            marginTop: 35,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            Gyms Nearby
          </Text>

          <Text
            style={{
              color: "#777",
              fontSize: 14,
            }}
          >
            {filteredGyms.length} Gyms
          </Text>
        </View>

        {/* GYM LIST */}
        {isLoadingGyms ? (
          <View
            style={{
              marginTop: 22,
              backgroundColor: "#111",
              borderRadius: 24,
              padding: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <Text style={{ color: "#777", fontSize: 15 }}>
              Finding gyms near you...
            </Text>
          </View>
        ) : filteredGyms.length === 0 ? (
          <View
            style={{
              marginTop: 22,
              backgroundColor: "#111",
              borderRadius: 24,
              padding: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              No gyms found
            </Text>

            <Text
              style={{
                color: "#777",
                marginTop: 8,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              Try increasing the distance radius or choosing another location.
            </Text>
          </View>
        ) : (
          filteredGyms.map((gym) => (
            <TouchableOpacity
              key={gym.id || gym.id}
              onPress={() => openGymDetails(gym)}
              activeOpacity={0.85}
              style={{
                marginTop: 22,
                backgroundColor: "#111",
                borderRadius: 28,
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.04)",
              }}
            >
              {/* TOP */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, paddingRight: 14 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "white",
                      fontSize: 22,
                      fontWeight: "700",
                    }}
                  >
                    {gym.gymName || "Gym"}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={{
                      color: "#777",
                      marginTop: 6,
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {gym.address || "Address not available"} •{" "}
                    {formatDistance(gym.distanceKm)}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: "rgba(0,245,212,0.12)",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 14,
                  }}
                >
                  <Text
                    style={{
                      color: "#23ee09",
                      fontWeight: "600",
                    }}
                  >
                    {gym.isOpen === false ? "CLOSED" : "OPEN"}
                  </Text>
                </View>
              </View>

              {/* PRICE */}
              <View
                style={{
                  marginTop: 22,
                  flexDirection: "row",
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    color: "#23ee09",
                    fontSize: 30,
                    fontWeight: "bold",
                  }}
                >
                  ₹{gym.dailyPrice}
                </Text>

                <Text
                  style={{
                    color: "#777",
                    marginLeft: 8,
                    marginBottom: 4,
                  }}
                >
                  / daily pass
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 120 }} />
      </SafeAreaView>
    </ScrollView>
  );
}
