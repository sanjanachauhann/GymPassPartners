import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPasses } from "../../backend/middleware/passMiddleware";

type Pass = {
  _id?: string;
  id?: string;
  // gymId?: string;
  gymName?: string;
  duration?: number;
  price?: number;
  passType?: string;
  purchaseDate?: string;
  expiryDate?: string;
  active?: boolean;
  isActive?: boolean;
  photos?: string[];
  rating?: string;
};

const getDaysRemaining = (expiryDate?: string) => {
  if (!expiryDate) {
    return 0;
  }

  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return 0;
  }

  const millisecondsLeft = expiry.getTime() - Date.now();

  return Math.max(0, Math.ceil(millisecondsLeft / (1000 * 60 * 60 * 24)));
};

export default function Passes() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPasses = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await getPasses();

      setPasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setPasses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPasses();
    }, [loadPasses]),
  );

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#050505",
      }}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView style={{ paddingHorizontal: 20 }}>
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              color: "white",
              fontSize: 34,
              fontWeight: "bold",
            }}
          >
            My Passes
          </Text>

          <Text
            style={{
              color: "#777",
              marginTop: 8,
              fontSize: 15,
            }}
          >
            Track your active and expired gym passes
          </Text>
        </View>

        {isLoading ? (
          <View
            style={{
              marginTop: 28,
              backgroundColor: "#111",
              borderRadius: 24,
              padding: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="small" color="#23ee09" />

            <Text style={{ color: "#777", marginLeft: 12, fontSize: 15 }}>
              Loading passes...
            </Text>
          </View>
        ) : passes.length === 0 ? (
          <View
            style={{
              marginTop: 28,
              backgroundColor: "#111",
              borderRadius: 24,
              padding: 22,
              borderWidth: 1,
              borderColor: "rgba(0,245,212,0.15)",
            }}
          >
            <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
              No passes yet
            </Text>

            <Text
              style={{
                color: "#777",
                marginTop: 8,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              Create a pass from Explore to see it here.
            </Text>
          </View>
        ) : (
          passes.map((pass) => {
            const daysRemaining = getDaysRemaining(pass.expiryDate);
            const totalDays = pass.duration || 1;
            const usedDays = Math.min(totalDays, totalDays - daysRemaining);
            const progress = Math.min(100, (usedDays / totalDays) * 100);
            const isActive =
              Boolean(pass.active ?? pass.isActive) && daysRemaining > 0;

            return (
              <View
                key={pass._id || pass.id}
                style={{
                  marginTop: 28,
                  backgroundColor: "#111",
                  borderRadius: 30,
                  padding: 22,
                  borderWidth: 1,
                  borderColor: isActive
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,0,0,0.2)",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: "white",
                        fontSize: 24,
                        fontWeight: "700",
                      }}
                    >
                      {pass.gymName || "Gym Pass"}
                    </Text>

                    <Text
                      style={{
                        color: "#777",
                        marginTop: 6,
                        textTransform: "capitalize",
                      }}
                    >
                      {pass.passType || "day"} pass
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: isActive
                        ? "rgba(0,245,212,0.12)"
                        : "rgba(255,0,0,0.12)",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#23ee09" : "#FF4D4D",
                        fontWeight: "700",
                      }}
                    >
                      {isActive ? "ACTIVE" : "EXPIRED"}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 24 }}>
                  <Text
                    style={{
                      color: "#23ee09",
                      fontSize: 32,
                      fontWeight: "bold",
                    }}
                  >
                    ₹{pass.price ?? 0}
                  </Text>
                </View>

                <View style={{ marginTop: 28 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      Days Used
                    </Text>

                    <Text style={{ color: "#777" }}>
                      {usedDays} / {totalDays}
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 8,
                      backgroundColor: "#1A1A1A",
                      borderRadius: 20,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        backgroundColor: isActive ? "#23ee09" : "#FF4D4D",
                        borderRadius: 20,
                      }}
                    />
                  </View>

                  <Text
                    style={{
                      color: "#777",
                      marginTop: 14,
                      fontSize: 14,
                    }}
                  >
                    {isActive
                      ? `${daysRemaining} days remaining`
                      : "This pass has expired"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (isActive) {
                      router.push({
                        pathname: "/qr-pass",
                        params: {
                          passId: pass._id || pass.id,
                          gymName: pass.gymName,
                        },
                      });
                      return;
                    }

                    router.push({
                      pathname: "/createpass",
                      params: {
                        placeId: pass._id,
                        gymName: pass.gymName,
                        isActive: String(pass.isActive),
                      },
                    });
                  }}
                  activeOpacity={0.85}
                  style={{
                    marginTop: 30,
                    backgroundColor: isActive ? "#66f500" : "#FF4D4D",
                    paddingVertical: 18,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <Ionicons
                    name={isActive ? "qr-code" : "refresh"}
                    size={18}
                    color={isActive ? "#050505" : "white"}
                  />

                  <Text
                    style={{
                      color: isActive ? "#050505" : "white",
                      fontWeight: "bold",
                      fontSize: 16,
                      marginLeft: 10,
                    }}
                  >
                    {isActive ? "Use Pass" : "Renew Pass"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={{ height: 120 }} />
      </SafeAreaView>
    </ScrollView>
  );
}
