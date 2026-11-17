import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResponsive } from "@/hooks/use-responsive";

export default function QRPass() {
  const params = useLocalSearchParams<{ gymName?: string; passId?: string }>();
  const { scale, contentWidth, height } = useResponsive();
  // Big enough to scan easily, never wider than the screen or taller than ~40% of it.
  const qrSize = Math.round(
    Math.min(scale(220), contentWidth - 48, height * 0.4),
  );

  const passId =
    typeof params.passId === "string" && params.passId.trim()
      ? params.passId.trim()
      : "";
  const qrValue = JSON.stringify({
    type: "gympass",
    passId,
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#050505",
        padding: 24,
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 560,
          alignSelf: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 28,
              marginBottom: 8,
            }}
          >
            Your Gym QR
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: "#777",
              fontSize: 15,
              marginBottom: 40,
              maxWidth: "100%",
            }}
          >
            {params.gymName || "Active pass"}
          </Text>

          <QRCode value={qrValue} size={qrSize} />
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#23ee09",
            paddingVertical: 18,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Ionicons name="home" size={20} color="#050505" />

          <Text
            style={{
              color: "#050505",
              fontWeight: "bold",
              marginLeft: 8,
              fontSize: 16,
            }}
          >
            Return Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
