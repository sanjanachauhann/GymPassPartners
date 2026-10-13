import { createGymPartnerReq } from "@/backend/middleware/gymPartnerMiddleware";
import { useGymRegistration } from "@/context/GymRegistration";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CFEnvironment, CFSession } from "cashfree-pg-api-contract";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CFPaymentGatewayService } from "react-native-cashfree-pg-sdk";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createCashfreeOrder,
  verifyCashfreePayment,
} from "../backend/middleware/paymentMiddleware";
// remove any RazorpayCheckout / PayU / CCAvenue imports

export default function Payment() {
  // const params = useLocalSearchParams<{
  //   gymData?: string;
  // }>();

  // const gymData =
  //   typeof params.gymData === "string" ? JSON.parse(params.gymData) : null;

  const { registration, resetRegistration } = useGymRegistration();

  const [isPaying, setIsPaying] = useState(false);
  const registrationFee = 999;

  // const completePayment = async () => {
  //   if (isPaying) return;

  //   try {
  //     setIsPaying(true);

  //     // Simulate payment
  //     const paymentSuccess = true;

  //     if (!paymentSuccess) {
  //       throw new Error("Payment Failed");
  //     }

  //     console.log("Registration Data");
  //     console.log(registration);

  //     const data = await createGymPartnerReq(registration);

  //     console.log(data);

  //     if (data?.success) {
  //       // resetRegistration();

  //       // router.replace("/(tabs)");
  //       await AsyncStorage.setItem(
  //         "gymRequest",
  //         JSON.stringify({
  //           requestId: data.request._id,
  //           gymName: data.request.gymName,
  //           status: data.request.status,
  //         }),
  //       );

  //       router.replace({
  //         pathname: "/request-success",
  //         params: {
  //           requestId: data.request._id,
  //           gymName: data.request.gymName,
  //           status: data.request.status,
  //         },
  //       });
  //     } else {
  //       throw new Error("Gym registration failed");
  //     }
  //   } catch (error) {
  //     console.log(error);

  //     Alert.alert("Payment Failed", "Gym registration could not be completed.");
  //   } finally {
  //     setIsPaying(false);
  //   }
  // };

  // const completePayment = async () => {
  //   if (isPaying) return;
  //   console.log(registration);
  //   try {
  //     setIsPaying(true);

  //     // STEP 1:
  //     // Ask your backend to create a Razorpay order
  //     const orderResponse = await createRazorpayOrder(registrationFee);

  //     if (!orderResponse?.success) {
  //       throw new Error("Could not create payment order");
  //     }

  //     const order = orderResponse.order;

  //     console.log("Razorpay Order:", order);

  //     const keys: string = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "";

  //     if (!keys) {
  //       throw new Error("Razorpay Key ID is missing");
  //     }

  //     // STEP 2:
  //     // Open Razorpay Checkout
  //     const options = {
  //       description: "Gym Registration Fee",
  //       image: "https://your-domain.com/logo.png",
  //       currency: "INR",
  //       key: keys,
  //       amount: order.amount,
  //       name: "GymPass",
  //       order_id: order.id,
  //       prefill: {
  //         name: registration.ownerName || "",
  //         email: registration.email || "",
  //         contact: registration.phone || "",
  //       },

  //       theme: {
  //         color: "#23ee09",
  //       },
  //     };

  //     const paymentData = await RazorpayCheckout.open(options);

  //     console.log("Razorpay Payment Success:");
  //     console.log(paymentData);

  //     // STEP 3:
  //     // Verify payment on backend
  //     const verification = await verifyRazorpayPayment({
  //       razorpay_order_id: paymentData.razorpay_order_id,

  //       razorpay_payment_id: paymentData.razorpay_payment_id,

  //       razorpay_signature: paymentData.razorpay_signature,
  //     });

  //     if (!verification?.success) {
  //       throw new Error("Payment verification failed");
  //     }

  //     console.log("Payment verified successfully");

  //     // STEP 4:
  //     // ONLY NOW create the gym registration request
  //     console.log("Registration Data");
  //     console.log(registration);

  //     const data = await createGymPartnerReq(registration);

  //     console.log(data);

  //     if (data?.success) {
  //       await AsyncStorage.setItem(
  //         "gymRequest",
  //         JSON.stringify({
  //           requestId: data.request._id,
  //           gymName: data.request.gymName,
  //           status: data.request.status,
  //         }),
  //       );

  //       router.replace({
  //         pathname: "/request-success",
  //         params: {
  //           requestId: data.request._id,
  //           gymName: data.request.gymName,
  //           status: data.request.status,
  //         },
  //       });
  //     } else {
  //       throw new Error("Gym registration failed");
  //     }
  //   } catch (error) {
  //     console.log("Payment error:", error);

  //     Alert.alert("Payment Failed", "Your payment could not be completed.");
  //   } finally {
  //     setIsPaying(false);
  //   }
  // };

  // remove any RazorpayCheckout / PayU / CCAvenue imports

  // const completePayment = async () => {
  //   if (isPaying) return;

  //   try {
  //     setIsPaying(true);

  //     const orderResponse = await createCashfreeOrder(
  //       registrationFee,
  //       registration.ownerName || "",
  //       registration.email || "",
  //       registration.phone || "",
  //     );

  //     if (!orderResponse?.success) {
  //       throw new Error("Could not create payment order");
  //     }

  //     const { orderId, paymentSessionId } = orderResponse.order;

  //     CFPaymentGatewayService.setCallback({
  //       onVerify: async (verifiedOrderId: string) => {
  //         const verification = await verifyCashfreePayment(verifiedOrderId);

  //         if (!verification?.success) {
  //           Alert.alert("Payment Failed", "Payment could not be verified.");
  //           setIsPaying(false);
  //           return;
  //         }

  //         const regData = await createGymPartnerReq(registration);
  //         if (regData?.success) {
  //           await AsyncStorage.setItem(
  //             "gymRequest",
  //             JSON.stringify({
  //               requestId: regData.request._id,
  //               gymName: regData.request.gymName,
  //               status: regData.request.status,
  //             }),
  //           );
  //           router.replace({
  //             pathname: "/request-success",
  //             params: {
  //               requestId: regData.request._id,
  //               gymName: regData.request.gymName,
  //               status: regData.request.status,
  //             },
  //           });
  //         } else {
  //           setIsPaying(false);
  //           Alert.alert(
  //             "Payment Failed",
  //             "Gym registration could not be completed.",
  //           );
  //         }
  //       },
  //       onError: (error: any, verifiedOrderId: string) => {
  //         console.log("Cashfree error:", error, verifiedOrderId);
  //         setIsPaying(false);
  //         Alert.alert("Payment Failed", "Your payment could not be completed.");
  //       },
  //     });

  //     const session = new CFSession(
  //       paymentSessionId,
  //       orderId,
  //       process.env.EXPO_PUBLIC_CASHFREE_ENV === "production"
  //         ? CFEnvironment.PRODUCTION
  //         : CFEnvironment.SANDBOX,
  //     );

  //     CFPaymentGatewayService.doWebPayment(session);
  //   } catch (error) {
  //     console.log("Payment error:", error);
  //     setIsPaying(false);
  //     Alert.alert("Payment Failed", "Your payment could not be completed.");
  //   }
  // };

  const completePayment = async () => {
    if (isPaying) return;

    try {
      setIsPaying(true);

      console.log("Creating Cashfree order...");
      console.log("Registration fee:", registrationFee);

      const orderResponse = await createCashfreeOrder(
        registrationFee,
        registration.ownerName || "",
        registration.email || "",
        registration.phone || "",
      );

      console.log(
        "Cashfree order response:",
        JSON.stringify(orderResponse, null, 2),
      );

      if (!orderResponse?.success) {
        throw new Error(
          orderResponse?.message || "Could not create payment order",
        );
      }

      /*
       * Cashfree order data
       */
      const order = orderResponse.order;

      if (!order) {
        throw new Error("Cashfree order data is missing.");
      }

      const orderId = order.orderId || order.order_id;

      const paymentSessionId =
        order.paymentSessionId || order.payment_session_id;

      console.log("Cashfree order ID:", orderId);
      console.log("Cashfree payment session:", paymentSessionId);

      if (!orderId) {
        throw new Error("Cashfree order ID is missing.");
      }

      if (!paymentSessionId) {
        throw new Error("Cashfree payment session ID is missing.");
      }

      /*
       * Register Cashfree callbacks
       */
      CFPaymentGatewayService.setCallback({
        onVerify: async (verifiedOrderId: string) => {
          try {
            console.log("Cashfree payment verified:", verifiedOrderId);

            const verification = await verifyCashfreePayment(verifiedOrderId);

            console.log("Payment verification response:", verification);

            if (!verification?.success) {
              setIsPaying(false);

              Alert.alert(
                "Payment Failed",
                verification?.message || "Payment could not be verified.",
              );

              return;
            }

            /*
             * Payment is successful and verified.
             * Only now create the gym registration request.
             */
            console.log(
              "Payment verified. Creating gym registration request...",
            );

            const regData = await createGymPartnerReq(registration);

            console.log("Gym registration response:", regData);

            if (!regData?.success) {
              throw new Error(
                regData?.message || "Gym registration could not be completed.",
              );
            }

            await AsyncStorage.setItem(
              "gymRequest",
              JSON.stringify({
                requestId: regData.request._id,
                gymName: regData.request.gymName,
                status: regData.request.status,
              }),
            );

            setIsPaying(false);

            router.replace({
              pathname: "/request-success",
              params: {
                requestId: regData.request._id,
                gymName: regData.request.gymName,
                status: regData.request.status,
              },
            });
          } catch (error: any) {
            console.log(
              "Post-payment error:",
              error?.response?.data || error?.message || error,
            );

            setIsPaying(false);

            Alert.alert(
              "Registration Failed",
              error?.response?.data?.message ||
                error?.message ||
                "Your payment was successful, but the gym registration could not be completed.",
            );
          }
        },

        onError: (error: any, verifiedOrderId: string) => {
          console.log("Cashfree payment error:", error, verifiedOrderId);

          setIsPaying(false);

          Alert.alert(
            "Payment Failed",
            error?.message || "Your payment could not be completed.",
          );
        },
      });

      /*
       * Create Cashfree session
       */
      const environment =
        process.env.EXPO_PUBLIC_CASHFREE_ENV === "production"
          ? CFEnvironment.PRODUCTION
          : CFEnvironment.SANDBOX;

      const session = new CFSession(paymentSessionId, orderId, environment);

      console.log("Opening Cashfree payment...");

      CFPaymentGatewayService.doWebPayment(session);
    } catch (error: any) {
      console.log(
        "Payment error:",
        error?.response?.data || error?.message || error,
      );

      setIsPaying(false);

      Alert.alert(
        "Payment Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Your payment could not be completed.",
      );
    }
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#050505",
        padding: 20,
      }}
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

      <View style={{ marginTop: 32 }}>
        <Text
          style={{
            color: "white",
            fontSize: 26,
            fontWeight: "bold",
          }}
        >
          Payment
        </Text>

        <Text
          style={{
            color: "#777",
            marginTop: 8,
            fontSize: 13,
          }}
        >
          Review your pass before completing payment.
        </Text>
      </View>

      <View
        style={{
          marginTop: 34,
          backgroundColor: "#111",
          borderRadius: 28,
          padding: 22,
          borderWidth: 1,
          borderColor: "rgba(0,245,212,0.16)",
        }}
      >
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: "rgba(0,245,212,0.12)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="fitness" size={25} color="#23ee09" />
        </View>

        <Text
          numberOfLines={1}
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            marginTop: 20,
          }}
        >
          {/* {gymName} */}
          {registration.gymName}
        </Text>

        <Text
          style={{
            color: "#777",
            marginTop: 8,
            fontSize: 13,
            textTransform: "capitalize",
          }}
        >
          {/* {passPeriod} pass */}
          Gym Registration Fee
        </Text>

        <View
          style={{
            marginTop: 28,
            paddingTop: 22,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.08)",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#777",
              fontSize: 13,
            }}
          >
            Amount
          </Text>

          <Text
            style={{
              color: "#23ee09",
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            {/* ₹{price} */}₹{registrationFee}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        onPress={completePayment}
        disabled={isPaying}
        activeOpacity={isPaying ? 1 : 0.85}
        style={{
          backgroundColor: isPaying ? "#1A1A1A" : "#23ee09",
          paddingVertical: 18,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        {isPaying ? (
          <ActivityIndicator size="small" color="#777" />
        ) : (
          <Ionicons name="lock-closed" size={20} color="#050505" />
        )}

        <Text
          style={{
            color: isPaying ? "#777" : "#050505",
            fontWeight: "bold",
            marginLeft: 8,
            fontSize: 16,
          }}
        >
          {isPaying ? "Registering Gym..." : `Pay ₹${registrationFee}`}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
