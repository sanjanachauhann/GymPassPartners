import { useGymRegistration } from "@/context/GymRegistration";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PassPeriod = "day" | "week" | "month" | "quarterly" | "yearly";

// const passOptions: {
//   label: string;
//   value: PassPeriod;
//   duration: number;
//   price: number;
// }[] = [
//   { label: "Day", value: "day", duration: 1, price: 199 },
//   { label: "Week", value: "week", duration: 7, price: 999 },
//   { label: "Month", value: "month", duration: 30, price: 2999 },
//   { label: "Quarterly", value: "quarterly", duration: 90, price: 7499 },
//   { label: "Yearly", value: "yearly", duration: 365, price: 24999 },
// ];

export default function GymDetails() {
  const params = useLocalSearchParams<{
    placeId?: string;
    gymName?: string;
    gymAddress?: string;
    isActive?: string;
    photos?: string[];
    rating?: string;
    ownerName: string;
    email: string;
    phone: string;
  }>();

  const { registration, setRegistration } = useGymRegistration();

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedPassType, setSelectedPassType] = useState("");
  const [price, setPrice] = useState("");

  // const [selectedPeriod, setSelectedPeriod] = useState<PassPeriod | null>(null);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const gymName =
    typeof params.gymName === "string" && params.gymName.trim()
      ? params.gymName
      : "Selected Gym";

  // const selectedPass = useMemo(
  //   () => passOptions.find((option) => option.value === selectedPeriod),
  //   [selectedPeriod],
  // );
  // const [gymData, setGymData] = useState({
  //   gymName,
  //   partnerId: params.partnerId,
  //   placeId: params.placeId,
  //   address: params.gymAddress ?? "",
  //   passes: {
  //     daily: "",
  //     weekly: "",
  //     monthly: "",
  //     yearly: "",
  //   },
  // });

  // console.log("gym params", params);

  // const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  // const photoUrls = photos.map((photoReference: string) => `${photoReference}`);

  useEffect(() => {
    setRegistration((prev) => ({
      ...prev,

      // partnerId: params.partnerId ?? "",
      gymName,
      address: params.gymAddress ?? "",
      placeId: params.placeId ?? "",
      rating: params.rating ?? "",
      // photos: photoUrls,
    }));
  }, []);

  const payForPass = () => {
    const { daily, weekly, monthly, yearly } = registration.passes;

    if (!daily || !weekly || !monthly || !yearly) {
      Alert.alert(
        "Missing Pass Prices",
        "Please set prices for Daily, Weekly, Monthly and Yearly passes before registering your gym.",
      );
      return;
    }

    // router.push("/payment");
    router.push({
      pathname: "/payment",
      params: {
        registration: JSON.stringify(registration),
      },
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#050505",
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 130,
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: "#111",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={{ marginTop: 26 }}>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            {/* {params.isActive === "true" ? "Create Pass" : "Renew pass"} */}
            Select prices
          </Text>

          <Text
            style={{
              color: "#777",
              marginTop: 8,
              fontSize: 12,
            }}
          >
            Select the pass price for the specific duration
          </Text>
        </View>

        <View style={{ marginTop: 34 }}>
          <Text style={{ color: "#777", marginBottom: 10, fontSize: 13 }}>
            Gym Name
          </Text>

          <View
            style={{
              backgroundColor: "#111",
              borderRadius: 20,
              paddingHorizontal: 18,
              paddingVertical: 18,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <Text
              numberOfLines={1}
              style={{ color: "white", fontSize: 13, fontWeight: "700" }}
            >
              {gymName}
            </Text>
          </View>
        </View>

        {params.gymAddress && (
          <View style={{ marginTop: 34 }}>
            <Text style={{ color: "#777", marginBottom: 10, fontSize: 13 }}>
              Address
            </Text>

            <View
              style={{
                backgroundColor: "#111",
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 18,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <Text
                numberOfLines={1}
                style={{ color: "white", fontSize: 13, fontWeight: "700" }}
              >
                {params.gymAddress}
              </Text>
            </View>
          </View>
        )}

        {/* PASS PRICES */}

        <Text
          style={{
            color: "white",
            marginTop: 42,
            fontSize: 20,
            fontWeight: "700",
          }}
        >
          Pass Prices
        </Text>

        <Text
          style={{
            color: "#666",
            marginTop: 8,
            marginBottom: 22,
          }}
        >
          Set prices that users will pay.
        </Text>

        {["Daily Pass", "Weekly Pass", "Monthly Pass", "Yearly Pass"].map(
          (item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedPassType(item);
                setPrice("");
                setShowPriceModal(true);
              }}
              style={{
                backgroundColor: "#111",
                marginBottom: 16,
                borderRadius: 22,
                padding: 20,
                borderWidth: 1,
                borderColor: "#1A1A1A",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {item}
                </Text>

                <Text
                  style={{
                    color: "#666",
                    marginTop: 6,
                  }}
                >
                  Tap to set price
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "rgba(35,238,9,0.12)",
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    color: "#23EE09",
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  ₹
                  {item === "Daily Pass"
                    ? registration.passes.daily || "0"
                    : item === "Weekly Pass"
                      ? registration.passes.weekly || "0"
                      : item === "Monthly Pass"
                        ? registration.passes.monthly || "0"
                        : registration.passes.yearly || "0"}
                </Text>
              </View>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>
      {/* BUTTON */}

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,

          backgroundColor: "#050505",

          padding: 20,

          borderTopWidth: 1,

          borderTopColor: "#111",
        }}
      >
        <TouchableOpacity
          onPress={payForPass}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#23EE09",
            height: 62,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Ionicons name="checkmark-circle" size={22} color="#050505" />

          <Text
            style={{
              color: "#050505",
              marginLeft: 10,
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            Register Gym
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPriceModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: "#111",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 24,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                {selectedPassType}
              </Text>

              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="Enter Price"
                placeholderTextColor="#666"
                style={{
                  backgroundColor: "#1A1A1A",
                  color: "white",
                  marginTop: 20,
                  borderRadius: 18,
                  padding: 18,
                  fontSize: 18,
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  setRegistration((prev) => ({
                    ...prev,

                    passes: {
                      ...prev.passes,

                      ...(selectedPassType === "Daily Pass" && {
                        daily: price,
                      }),

                      ...(selectedPassType === "Weekly Pass" && {
                        weekly: price,
                      }),

                      ...(selectedPassType === "Monthly Pass" && {
                        monthly: price,
                      }),

                      ...(selectedPassType === "Yearly Pass" && {
                        yearly: price,
                      }),
                    },
                  }));
                  setShowPriceModal(false);
                }}
                style={{
                  marginTop: 24,
                  backgroundColor: "#23EE09",
                  borderRadius: 18,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  bottom: "10%",
                }}
              >
                <Text
                  style={{
                    color: "#050505",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  Save Price
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
