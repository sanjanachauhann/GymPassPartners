import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getGymRequest } from "@/backend/middleware/gymPartnerMiddleware";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RequestSuccess() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );

  const [email, setEmail] = useState("");

  useEffect(() => {
    loadRequest();
  }, []);

  const loadRequest = async () => {
    try {
      const saved = await AsyncStorage.getItem("gymRequest");

      if (!saved) {
        router.replace("/signup");
        return;
      }

      const local = JSON.parse(saved);

      const response = await getGymRequest(local.requestId);

      if (!response.success) return;

      const request = response.request;

      setStatus(request.status);
      setEmail(request.email);

      await AsyncStorage.setItem(
        "gymRequest",
        JSON.stringify({
          requestId: request._id,
          gymName: request.gymName,
          status: request.status,
          email: request.email,
        }),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivated = () => {
    Alert.alert(
      "Activation Required",
      "We've sent an activation email to your registered email address. Please create your password using that email before logging in.",
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#050505",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      {/* Glow */}
      <View
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: "#22ff00",
          opacity: 0.08,
          alignSelf: "center",
        }}
      />

      <View
        style={{
          backgroundColor: "#111",
          borderRadius: 34,
          padding: 28,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {/* ICON */}
        <View
          style={{
            width: 95,
            height: 95,
            borderRadius: 48,
            backgroundColor: "rgba(35,238,9,0.12)",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Text style={{ fontSize: 46 }}>
            {status === "approved" ? "🎉" : status === "pending" ? "⏳" : "❌"}
          </Text>
        </View>

        {/* STATUS BADGE */}
        <View
          style={{
            alignSelf: "center",
            marginTop: 18,
            backgroundColor:
              status === "approved"
                ? "rgba(35,238,9,0.15)"
                : status === "pending"
                  ? "rgba(255,200,0,0.15)"
                  : "rgba(255,0,0,0.15)",

            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 30,
          }}
        >
          <Text
            style={{
              color:
                status === "approved"
                  ? "#23ee09"
                  : status === "pending"
                    ? "#FFC107"
                    : "#FF5252",
              fontWeight: "700",
              letterSpacing: 1,
            }}
          >
            {status.toUpperCase()}
          </Text>
        </View>

        {/* TITLE */}

        <Text
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: "700",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          {status === "approved"
            ? "Application Approved"
            : status === "pending"
              ? "Request Submitted"
              : "Application Rejected"}
        </Text>

        {/* DESCRIPTION */}

        <Text
          style={{
            color: "#9CA3AF",
            textAlign: "center",
            fontSize: 16,
            lineHeight: 26,
            marginTop: 18,
          }}
        >
          {status === "approved"
            ? "Congratulations! Your gym has been approved. We've sent an activation email to your registered email address."
            : status === "pending"
              ? "Your application is currently being reviewed by our team. You'll receive an email once it's approved."
              : "Unfortunately your application couldn't be approved at this time."}
        </Text>

        {/* EMAIL */}

        {status === "approved" && (
          <View
            style={{
              marginTop: 24,
              backgroundColor: "#181818",
              borderRadius: 18,
              paddingVertical: 16,
              paddingHorizontal: 18,
              borderWidth: 1,
              borderColor: "rgba(35,238,9,0.25)",
            }}
          >
            <Text
              style={{
                color: "#23ee09",
                textAlign: "center",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {email}
            </Text>
          </View>
        )}

        {/* FOOTNOTE */}

        {status === "approved" && (
          <Text
            style={{
              color: "#888",
              textAlign: "center",
              marginTop: 18,
              lineHeight: 24,
            }}
          >
            Open your email and click the activation link to create your
            password.
          </Text>
        )}

        {/* BUTTON */}

        {status === "approved" && (
          <TouchableOpacity
            onPress={handleActivated}
            style={{
              backgroundColor: "#23ee09",
              height: 60,
              borderRadius: 18,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 34,
            }}
          >
            <Text
              style={{
                color: "#050505",
                fontWeight: "700",
                fontSize: 17,
              }}
            >
              I've Activated My Account
            </Text>
          </TouchableOpacity>
        )}

        {status === "rejected" && (
          <TouchableOpacity
            onPress={() => {
              AsyncStorage.removeItem("gymRequest");
              router.replace("/signup");
            }}
            style={{
              backgroundColor: "#23ee09",
              height: 60,
              borderRadius: 18,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 34,
            }}
          >
            <Text
              style={{
                color: "#050505",
                fontWeight: "700",
                fontSize: 17,
              }}
            >
              Submit Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
