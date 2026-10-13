import { updateGymPasses } from "@/backend/services/gymService";
import { useGym } from "@/context/GymContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Memberships() {
  const { gym, loadingGym, refreshGym } = useGym();

  const [passes, setPasses] = useState({
    daily: "",
    weekly: "",
    monthly: "",
    yearly: "",
  });

  // Load the actual passes from the GymContext
  useEffect(() => {
    if (!gym) {
      return;
    }

    console.log("GYM IN MEMBERSHIP SCREEN:", gym);
    console.log("GYM PASSES:", gym.passes);

    setPasses({
      daily: String(gym.passes?.daily ?? ""),
      weekly: String(gym.passes?.weekly ?? ""),
      monthly: String(gym.passes?.monthly ?? ""),
      yearly: String(gym.passes?.yearly ?? ""),
    });
  }, [gym]);

  const saveMemberships = async () => {
    if (!gym) {
      console.log("No gym loaded");
      return;
    }

    try {
      const updatedPasses = {
        daily: Number(passes.daily),
        weekly: Number(passes.weekly),
        monthly: Number(passes.monthly),
        yearly: Number(passes.yearly),
      };

      console.log("SAVING PASSES:", updatedPasses);

      const response = await updateGymPasses(gym._id, updatedPasses);

      console.log("PASSES UPDATED:", response);

      await refreshGym();

      // Optional
      Alert.alert("Success", "Membership prices updated successfully");
    } catch (error: any) {
      console.error("Failed to update membership prices:", error);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update membership prices",
      );
    }
  };

  if (loadingGym) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050505",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#23ee09" />

        <Text
          style={{
            color: "#888",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          Loading gym...
        </Text>
      </View>
    );
  }

  if (!gym) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050505",
          justifyContent: "center",
          alignItems: "center",
          padding: 30,
        }}
      >
        <Ionicons name="alert-circle-outline" size={50} color="#23ee09" />

        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "700",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Gym information unavailable
        </Text>

        <Text
          style={{
            color: "#777",
            fontSize: 14,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          We couldn't load your gym information.
        </Text>
      </View>
    );
  }

  const renderCard = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    value: string,
    key: keyof typeof passes,
  ) => (
    <View
      style={{
        backgroundColor: "#111",
        borderRadius: 24,
        padding: 20,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "rgba(35,238,9,0.15)",
      }}
    >
      {/* PLAN TITLE */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: "rgba(35,238,9,0.12)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name={icon} size={22} color="#23ee09" />
        </View>

        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: "700",
            marginLeft: 14,
          }}
        >
          {title}
        </Text>
      </View>

      {/* PRICE */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#1A1A1A",
          borderRadius: 18,
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            color: "#23ee09",
            fontSize: 14,
            fontWeight: "700",
          }}
        >
          ₹
        </Text>

        <TextInput
          keyboardType="numeric"
          value={value}
          onChangeText={(text) => {
            // Only allow numbers
            const numericValue = text.replace(/[^0-9]/g, "");

            setPasses((prev) => ({
              ...prev,
              [key]: numericValue,
            }));
          }}
          placeholder="Enter Price"
          placeholderTextColor="#555"
          style={{
            flex: 1,
            color: "white",
            fontSize: 16,
            marginLeft: 10,
            paddingVertical: 16,
          }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#050505",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 26,
            fontWeight: "700",
            letterSpacing: -0.7,
          }}
        >
          Membership Plans
        </Text>

        <Text
          style={{
            color: "#888",
            marginTop: 8,
            marginBottom: 8,
            fontSize: 13,
          }}
        >
          Update the prices your customers see in the GymPass app.
        </Text>

        {/* GYM NAME */}
        <Text
          style={{
            color: "#23ee09",
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 30,
          }}
        >
          {gym.gymName}
        </Text>

        {/* DAILY */}
        {renderCard("Daily Pass", "calendar", passes.daily, "daily")}

        {/* WEEKLY */}
        {renderCard("Weekly Pass", "calendar-outline", passes.weekly, "weekly")}

        {/* MONTHLY */}
        {renderCard(
          "Monthly Pass",
          "calendar-number",
          passes.monthly,
          "monthly",
        )}

        {/* YEARLY */}
        {renderCard("Yearly Pass", "trophy", passes.yearly, "yearly")}

        {/* SAVE */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={saveMemberships}
          style={{
            backgroundColor: "#23ee09",
            borderRadius: 22,
            paddingVertical: 18,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: "#050505",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            Save Changes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
