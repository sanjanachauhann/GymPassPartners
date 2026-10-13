import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { getNearbyGyms } from "../../backend/middleware/gymMiddleware";

import { validatePass } from "@/backend/middleware/scanPassMiddle";
import { CameraView, useCameraPermissions } from "expo-camera";

type SavedLocation = {
  location: string;
  latitude: number;
  longitude: number;
};

type ActivePass = {
  _id?: string;
  id?: string;
  gymName?: string;
  price?: number | string;
  passType?: string;
  purchaseDate?: string;
  expiryDate?: string;
};

type NearbyGym = {
  _id?: string;
  id?: string;
  gymName?: string;
  address?: string;
  rating?: number;
  distanceKm?: number;
};

const fallbackLocation = "Choose location";
const distanceOptions = [1, 3, 5, 10, 25];

const formatAddress = (place: Location.LocationGeocodedAddress) =>
  [place.name, place.street, place.city, place.region]
    .filter(Boolean)
    .join(", ");

const formatPassDate = (date?: string) => {
  if (!date) {
    return "Not available";
  }

  const passDate = new Date(date);

  if (Number.isNaN(passDate.getTime())) {
    return "Not available";
  }

  return passDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
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
    return {
      location: savedLocation,
      latitude: 0,
      longitude: 0,
    };
  }

  return null;
};

const parsePassIdFromQr = (data: string) => {
  try {
    const parsed = JSON.parse(data);

    if (parsed?.type === "gympass" && typeof parsed.passId === "string") {
      return parsed.passId.trim();
    }
  } catch {
    if (data.startsWith("gympass-")) {
      return data.replace(/^gympass-/, "").trim();
    }
  }

  return "";
};

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [successfulScans, setSuccessfulScans] = useState(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);
  const scanningRef = useRef(false);

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanningRef.current) return;

    scanningRef.current = true;
    setScanned(true);

    try {
      const passId = parsePassIdFromQr(data);

      if (!passId) {
        Alert.alert("Invalid QR", "This QR code is not a GymPass pass.");
        return;
      }

      const response = await validatePass(passId);

      setSuccessfulScans((prev) => prev + 1);
      Alert.alert("Success", response.message);
    } catch (err: unknown) {
      console.log("Validation error:", err);

      const validationError = err as {
        message?: string;
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      const message =
        validationError.response?.data?.message ||
        validationError.message ||
        "Validation failed";

      Alert.alert("Error", message);
    } finally {
      setTimeout(() => {
        scanningRef.current = false;
        setScanned(false);
      }, 2000);
    }
  };
  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#050505",
        }}
      >
        <Text style={{ color: "white" }}>Camera permission required</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#050505",
      }}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            marginTop: 24,
            backgroundColor: "#111",
            borderRadius: 30,
            padding: 18,
            borderWidth: 1,
            borderColor: "rgba(0,245,212,0.15)",
            shadowColor: "#23ee09",
            shadowOpacity: 0.18,
            shadowRadius: 18,
            shadowOffset: {
              width: 0,
              height: 0,
            },
            elevation: 8,
          }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  color: "white",
                  fontSize: 19,
                  fontWeight: "700",
                }}
              >
                QR Scanner
              </Text>

              <Text
                style={{
                  color: "#777",
                  marginTop: 4,
                }}
              >
                Scan customer's GymPass
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "rgba(35,238,9,0.12)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: "#23ee09",
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                READY
              </Text>
            </View>
          </View>

          {/* CAMERA */}
          <View
            style={{
              height: 320,
              borderRadius: 24,
              overflow: "hidden",
              backgroundColor: "#050505",
              position: "relative",
            }}
          >
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
            />

            {/* Scanner Box */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 220,
                  height: 220,
                }}
              >
                {/* TOP LEFT */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 42,
                    height: 42,
                    borderTopWidth: 5,
                    borderLeftWidth: 5,
                    borderColor: "#23ee09",
                    borderTopLeftRadius: 18,
                  }}
                />

                {/* TOP RIGHT */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 42,
                    height: 42,
                    borderTopWidth: 5,
                    borderRightWidth: 5,
                    borderColor: "#23ee09",
                    borderTopRightRadius: 18,
                  }}
                />

                {/* BOTTOM LEFT */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 42,
                    height: 42,
                    borderBottomWidth: 5,
                    borderLeftWidth: 5,
                    borderColor: "#23ee09",
                    borderBottomLeftRadius: 18,
                  }}
                />

                {/* BOTTOM RIGHT */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 42,
                    height: 42,
                    borderBottomWidth: 5,
                    borderRightWidth: 5,
                    borderColor: "#23ee09",
                    borderBottomRightRadius: 18,
                  }}
                />

                {/* SCANNING LINE */}
                <View
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 12,
                    right: 12,
                    height: 3,
                    backgroundColor: "#23ee09",
                    borderRadius: 10,

                    shadowColor: "#23ee09",
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 10,
                  }}
                />
              </View>
            </View>
          </View>

          {/* FOOTER */}
          <View
            style={{
              marginTop: 18,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="scan-circle" size={22} color="#23ee09" />

            <Text
              style={{
                color: "#999",
                marginLeft: 10,
                flex: 1,
                lineHeight: 20,
                fontSize: 13,
              }}
            >
              Hold the customer's QR inside the frame. Scanning happens
              automatically.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
