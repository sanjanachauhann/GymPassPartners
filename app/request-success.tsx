import { getGymRequest } from "@/backend/middleware/gymPartnerMiddleware";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RequestSuccess() {
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [request, setRequest] = useState({
    requestId: "",
    gymName: "",
    status: "pending",
  });
  const progress = [
    {
      title: "Request Raised",
      done: true,
    },
    {
      title: "Payment Successful",
      done: true,
    },
    {
      title: "Waiting for Admin Review",
      done: request.status !== "rejected",
      active: request.status === "pending",
    },
    {
      title: "Approved",
      done: request.status === "approved",
      active: request.status === "approved",
    },
    {
      title: "Live on GymPass",
      done: false,
    },
  ];

  useEffect(() => {
    loadRequest();
  }, []);

  //   const loadRequest = async () => {
  //     const saved = await AsyncStorage.getItem("gymRequest");

  //     if (!saved) return;

  //     const data = JSON.parse(saved);

  //     setRequest({
  //       requestId: data.requestId,
  //       gymName: data.gymName,
  //       status: data.status,
  //     });
  //   };
  const loadRequest = async () => {
    try {
      const saved = await AsyncStorage.getItem("gymRequest");

      if (!saved) return;

      const localRequest = JSON.parse(saved);

      const response = await getGymRequest(localRequest.requestId);

      if (!response?.success) return;

      const latest = response.request;

      setRequest({
        requestId: latest._id,
        gymName: latest.gymName,
        status: latest.status,
      });

      await AsyncStorage.setItem(
        "gymRequest",
        JSON.stringify({
          requestId: latest._id,
          gymName: latest.gymName,
          status: latest.status,
          email: latest.email,
        }),
      );

      if (latest.status === "approved") {
        // await AsyncStorage.removeItem("gymRequest");

        // router.replace("/login");
        await AsyncStorage.setItem(
          "pendingPartner",
          JSON.stringify({
            email: latest.email,
          }),
        );

        router.replace("/success_req");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const refreshStatus = async () => {
    setRefreshing(true);

    await loadRequest();

    setRefreshing(false);
  };

  const shortRequestId = request.requestId
    ? request.requestId.slice(-8).toUpperCase()
    : "";

  const copyRequestId = async () => {
    if (!request.requestId) return;

    await Clipboard.setStringAsync(request.requestId);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const statusColor =
    request.status === "approved"
      ? "#23EE09"
      : request.status === "rejected"
        ? "#FF5252"
        : "#FFD54F";

  const statusBg =
    request.status === "approved"
      ? "rgba(35,238,9,0.15)"
      : request.status === "rejected"
        ? "rgba(255,82,82,0.15)"
        : "rgba(255,190,0,0.15)";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#050505",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "rgba(35,238,9,0.15)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="checkmark" size={60} color="#23EE09" />
          </View>

          <Text
            style={{
              color: "white",
              fontSize: 30,
              fontWeight: "bold",
              marginTop: 25,
            }}
          >
            Request Submitted
          </Text>

          <Text
            style={{
              color: "#888",
              textAlign: "center",
              marginTop: 10,
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            Your gym registration request has been received successfully.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#111",
            marginTop: 35,
            borderRadius: 24,
            padding: 22,
          }}
        >
          <Text
            style={{
              color: "#777",
              fontSize: 13,
            }}
          >
            REQUEST NUMBER
          </Text>

          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#1A1A1A",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: 18,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#23EE09",
                  fontSize: 24,
                  fontWeight: "bold",
                  letterSpacing: 1,
                }}
              >
                #{shortRequestId}
              </Text>

              <Text
                style={{
                  color: "#666",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                Tap the copy icon to copy the full Request ID
              </Text>
            </View>

            <TouchableOpacity
              onPress={copyRequestId}
              activeOpacity={0.8}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: copied ? "rgba(35,238,9,0.18)" : "#232323",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={22}
                color={copied ? "#23EE09" : "white"}
              />
            </TouchableOpacity>
          </View>

          {copied && (
            <Text
              style={{
                color: "#23EE09",
                marginTop: 10,
                fontWeight: "600",
              }}
            >
              ✓ Full Request ID copied
            </Text>
          )}
          <View
            style={{
              height: 1,
              backgroundColor: "#222",
              marginVertical: 20,
            }}
          />

          <Text
            style={{
              color: "#777",
              fontSize: 13,
            }}
          >
            GYM
          </Text>

          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "600",
              marginTop: 6,
            }}
          >
            {request.gymName}
          </Text>

          <View
            style={{
              height: 1,
              backgroundColor: "#222",
              marginVertical: 20,
            }}
          />

          <Text
            style={{
              color: "#777",
              fontSize: 13,
            }}
          >
            CURRENT STATUS
          </Text>

          <View
            style={{
              backgroundColor: statusBg,
              alignSelf: "flex-start",
              marginTop: 10,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: statusColor,
                fontWeight: "700",
              }}
            >
              {request.status === "pending"
                ? "Waiting for Approval"
                : request.status === "approved"
                  ? "Approved"
                  : "Rejected"}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: "700",
            marginTop: 40,
            marginBottom: 25,
          }}
        >
          Progress
        </Text>

        {progress.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              marginBottom: 28,
            }}
          >
            <View
              style={{
                alignItems: "center",
                marginRight: 18,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: item.done ? "#23EE09" : "#333",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {item.done && (
                  <Ionicons name="checkmark" size={13} color="#050505" />
                )}
              </View>

              {index !== 4 && (
                <View
                  style={{
                    width: 2,
                    height: 42,
                    backgroundColor: "#333",
                  }}
                />
              )}
            </View>

            <View>
              <Text
                style={{
                  color: item.done ? "white" : "#777",
                  fontSize: 18,
                  fontWeight: item.active ? "700" : "600",
                }}
              >
                {item.title}
              </Text>
            </View>
          </View>
        ))}

        <View
          style={{
            backgroundColor: "#111",
            borderRadius: 22,
            padding: 18,
            marginBottom: 30,
          }}
        >
          <Text
            style={{
              color: "#23EE09",
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            Estimated Approval
          </Text>

          <Text
            style={{
              color: "#AAA",
              marginTop: 8,
              lineHeight: 22,
            }}
          >
            Our team usually reviews gym registrations within 24–48 hours.
            You'll receive a notification once your request has been approved.
          </Text>
        </View>

        <TouchableOpacity
        //   onPress={() =>
        //     router.push({
        //       pathname: "/track-request",
        //       params: {
        //         requestNumber,
        //       },
        //     })
        //   }
        //   style={{
        //     backgroundColor: "#23EE09",
        //     height: 60,
        //     borderRadius: 20,
        //     justifyContent: "center",
        //     alignItems: "center",
        //   }}
        >
          <Text
            style={{
              color: "#050505",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Track Request
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => BackHandler.exitApp()}
          style={{
            marginTop: 16,
            height: 58,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#333",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "600",
              fontSize: 17,
            }}
          >
            Exit App
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={refreshStatus}
          disabled={refreshing}
          style={{
            marginTop: 16,
            height: 58,
            borderRadius: 20,
            backgroundColor: "#23EE09",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#050505",
              fontWeight: "700",
              fontSize: 17,
            }}
          >
            {refreshing ? "Checking..." : "Refresh Status"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
