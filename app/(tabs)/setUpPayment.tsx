import {
  getCashfreeVendorStatusApi,
  setupCashfreeVendorApi,
} from "@/backend/services/paymentService";
import { useAuth } from "@/context/AuthContext";
import { useGym } from "@/context/GymContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentStatus = "NOT_CONNECTED" | "PENDING" | "ACTIVE" | "REJECTED";

export default function SetUpPayment() {
  const { gym } = useGym();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const [status, setStatus] = useState<PaymentStatus>("NOT_CONNECTED");

  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [panNumber, setPanNumber] = useState("");

  /*
   * Convert Cashfree status into our UI status.
   */
  const mapCashfreeStatus = (cfStatus?: string): PaymentStatus => {
    switch (cfStatus) {
      case "ACTIVE":
        return "ACTIVE";

      case "IN_BENE_CREATION":
      case "PENDING":
      case "UNDER_REVIEW":
        return "PENDING";

      case "REJECTED":
        return "REJECTED";

      default:
        return "NOT_CONNECTED";
    }
  };

  /*
   * Load the real vendor status from Cashfree.
   */
  const loadPaymentStatus = async () => {
    try {
      setLoading(true);

      if (!gym?._id) {
        setStatus("NOT_CONNECTED");
        return;
      }

      console.log("Checking Cashfree vendor for gym:", gym._id);

      const response = await getCashfreeVendorStatusApi(gym._id);

      console.log("Cashfree vendor status:", response);

      if (!response?.success) {
        setStatus("NOT_CONNECTED");
        return;
      }

      setStatus(mapCashfreeStatus(response.status));
    } catch (error: any) {
      console.log(
        "Cashfree vendor status error:",
        error?.response?.data || error?.message || error,
      );

      setStatus("NOT_CONNECTED");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Check Cashfree whenever the gym becomes available.
   */
  useEffect(() => {
    if (gym?._id) {
      loadPaymentStatus();
    }
  }, [gym?._id]);

  /*
   * Submit bank details.
   */
  const submitBankDetails = async () => {
    if (connecting) return;

    if (!gym?._id) {
      Alert.alert(
        "Something went wrong",
        "Gym information is not available. Please try again.",
      );
      return;
    }

    if (
      !accountHolder.trim() ||
      !accountNumber.trim() ||
      !ifsc.trim() ||
      !panNumber.trim()
    ) {
      Alert.alert(
        "Missing details",
        "Please fill in all the required details.",
      );
      return;
    }

    try {
      setConnecting(true);

      console.log("Setting up Cashfree vendor for gym:", gym._id);

      const response = await setupCashfreeVendorApi(gym._id, {
        accountHolder: accountHolder.trim(),

        accountNumber: accountNumber.trim(),

        ifsc: ifsc.trim().toUpperCase(),

        panNumber: panNumber.trim().toUpperCase(),

        name: gym.gymName,

        email: user?.email,

        phoneNumber: user?.phone,
      });

      console.log("Cashfree vendor response:", response);

      /*
       * Keep the raw Cashfree error visible.
       */
      if (!response?.success) {
        const message =
          response?.message || "Unable to set up your payout account.";

        Alert.alert("Payment setup failed", String(message));

        return;
      }

      /*
       * Update status immediately.
       */
      setStatus(mapCashfreeStatus(response.vendorStatus));

      /*
       * Clear the form.
       */
      setAccountHolder("");
      setAccountNumber("");
      setIfsc("");
      setPanNumber("");

      Alert.alert("Details submitted", "Your bank account is being verified.");

      /*
       * Refresh the real Cashfree status.
       */
      await loadPaymentStatus();
    } catch (error: any) {
      const rawError = error?.response?.data || error?.message || error;

      console.log("Cashfree vendor setup error:", rawError);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to set up your payout account.";

      Alert.alert("Payment setup failed", String(message));
    } finally {
      setConnecting(false);
    }
  };

  /*
   * Status configuration.
   */
  const getStatusConfig = () => {
    switch (status) {
      case "ACTIVE":
        return {
          icon: "checkmark-circle",
          iconColor: "#23ee09",
          background: "#0D1A0C",
          title: "Account connected",
          subtitle:
            "Your bank account is connected and ready to receive payments.",
        };

      case "PENDING":
        return {
          icon: "time-outline",
          iconColor: "#ffaa00",
          background: "#1A1508",
          title: "Verification pending",
          subtitle: "Your bank account is currently being verified.",
        };

      case "REJECTED":
        return {
          icon: "alert-circle-outline",
          iconColor: "#ff4444",
          background: "#1A0C0C",
          title: "Verification failed",
          subtitle:
            "Your payout account could not be verified. Please check your details and try again.",
        };

      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: "#050505",
      }}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 30,
          }}
        >
          {/* BACK BUTTON

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#111",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <Ionicons name="chevron-back" size={23} color="white" />
          </TouchableOpacity> */}

          {/* HEADER */}

          <View style={{ marginTop: "10%" }}>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 26,
                fontWeight: "700",
                letterSpacing: -0.7,
              }}
            >
              Payouts
            </Text>

            <Text
              style={{
                color: "#666",
                fontSize: 15,
                lineHeight: 21,
                marginTop: 7,
              }}
            >
              Manage your payment account.
            </Text>
          </View>

          {/* STATUS CARD */}

          {status !== "NOT_CONNECTED" && statusConfig && (
            <View
              style={{
                marginTop: 30,
                backgroundColor: statusConfig.background,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: "#202020",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: "#181818",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={statusConfig.icon as any}
                    size={27}
                    color={statusConfig.iconColor}
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 14,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 17,
                      fontWeight: "700",
                    }}
                  >
                    {statusConfig.title}
                  </Text>

                  <Text
                    style={{
                      color: "#777",
                      fontSize: 13,
                      lineHeight: 19,
                      marginTop: 4,
                    }}
                  >
                    {statusConfig.subtitle}
                  </Text>
                </View>
              </View>

              {status === "ACTIVE" && (
                <View
                  style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#222",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#23ee09",
                    }}
                  />

                  <Text
                    style={{
                      color: "#999",
                      fontSize: 13,
                      marginLeft: 9,
                    }}
                  >
                    Payments can be received
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* FORM */}

          {status !== "ACTIVE" && (
            <View
              style={{
                marginTop: 28,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 19,
                  fontWeight: "700",
                  marginBottom: 5,
                }}
              >
                Bank details
              </Text>

              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  lineHeight: 19,
                  marginBottom: 18,
                }}
              >
                Enter the bank details associated with your payout account.
              </Text>

              {/* ACCOUNT HOLDER */}

              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  fontWeight: "600",
                  marginBottom: 7,
                  marginLeft: 2,
                }}
              >
                ACCOUNT HOLDER NAME
              </Text>

              <TextInput
                placeholder="Enter account holder name"
                placeholderTextColor="#555"
                value={accountHolder}
                onChangeText={setAccountHolder}
                autoCapitalize="words"
                returnKeyType="next"
                editable={!connecting}
                style={{
                  height: 54,
                  backgroundColor: "#111",
                  color: "#FFFFFF",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: "#222",
                  marginBottom: 16,
                }}
              />

              {/* ACCOUNT NUMBER */}

              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  fontWeight: "600",
                  marginBottom: 7,
                  marginLeft: 2,
                }}
              >
                ACCOUNT NUMBER
              </Text>

              <TextInput
                placeholder="Enter account number"
                placeholderTextColor="#555"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                returnKeyType="next"
                editable={!connecting}
                secureTextEntry={false}
                style={{
                  height: 54,
                  backgroundColor: "#111",
                  color: "#FFFFFF",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: "#222",
                  marginBottom: 16,
                }}
              />

              {/* IFSC */}

              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  fontWeight: "600",
                  marginBottom: 7,
                  marginLeft: 2,
                }}
              >
                IFSC CODE
              </Text>

              <TextInput
                placeholder="Enter IFSC code"
                placeholderTextColor="#555"
                value={ifsc}
                onChangeText={setIfsc}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="next"
                editable={!connecting}
                maxLength={11}
                style={{
                  height: 54,
                  backgroundColor: "#111",
                  color: "#FFFFFF",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: "#222",
                  marginBottom: 16,
                }}
              />

              {/* PAN */}

              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  fontWeight: "600",
                  marginBottom: 7,
                  marginLeft: 2,
                }}
              >
                PAN NUMBER
              </Text>

              <TextInput
                placeholder="Enter PAN number"
                placeholderTextColor="#555"
                value={panNumber}
                onChangeText={setPanNumber}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                editable={!connecting}
                maxLength={10}
                style={{
                  height: 54,
                  backgroundColor: "#111",
                  color: "#FFFFFF",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: "#222",
                  marginBottom: 22,
                }}
              />

              {/* ADD BANK ACCOUNT */}

              <TouchableOpacity
                onPress={submitBankDetails}
                disabled={connecting}
                activeOpacity={0.85}
                style={{
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: connecting ? "#151515" : "#23ee09",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                {connecting ? (
                  <>
                    <ActivityIndicator size="small" color="#23ee09" />

                    <Text
                      style={{
                        color: "#777",
                        fontSize: 15,
                        fontWeight: "700",
                        marginLeft: 9,
                      }}
                    >
                      Verifying...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="card-outline" size={20} color="#050505" />

                    <Text
                      style={{
                        color: "#050505",
                        fontSize: 16,
                        fontWeight: "700",
                        marginLeft: 8,
                      }}
                    >
                      Add Bank Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* SECURITY NOTE */}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 17,
                }}
              >
                <Ionicons name="lock-closed-outline" size={14} color="#555" />

                <Text
                  style={{
                    color: "#555",
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  Your bank details are securely verified.
                </Text>
              </View>
            </View>
          )}

          {/* PENDING MESSAGE */}

          {status === "PENDING" && (
            <View
              style={{
                marginTop: 20,
                padding: 16,
                backgroundColor: "#0D0D0D",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#202020",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={19}
                  color="#777"
                />

                <Text
                  style={{
                    flex: 1,
                    color: "#777",
                    fontSize: 13,
                    lineHeight: 19,
                    marginLeft: 9,
                  }}
                >
                  Your payout account is being verified. You can leave this
                  screen and return later to check the latest status.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// import {
//   getCashfreeVendorStatusApi,
//   setupCashfreeVendorApi,
// } from "@/backend/services/paymentService";
// import { useAuth } from "@/context/AuthContext";
// import { useGym } from "@/context/GymContext";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   BackHandler,
//   Keyboard,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// type PaymentStatus = "NOT_CONNECTED" | "PENDING" | "ACTIVE" | "REJECTED";

// export default function SetUpPayment() {
//   const { gym } = useGym();
//   const { user } = useAuth();

//   const [loading, setLoading] = useState(true);
//   const [connecting, setConnecting] = useState(false);

//   const [status, setStatus] = useState<PaymentStatus>("NOT_CONNECTED");

//   const [gymName, setGymName] = useState("");

//   // Bank form
//   const [showBankForm, setShowBankForm] = useState(false);
//   const [accountHolder, setAccountHolder] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [ifsc, setIfsc] = useState("");
//   const [panNumber, setPanNumber] = useState("");

//   // Error modal
//   const [errorModalVisible, setErrorModalVisible] = useState(false);
//   const [errorTitle, setErrorTitle] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   useEffect(() => {
//     loadPaymentStatus();
//   }, []);

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       () => {
//         // If error modal is open, close it first
//         if (errorModalVisible) {
//           setErrorModalVisible(false);
//           return true;
//         }

//         // If bank form is open, close it first
//         if (showBankForm) {
//           Keyboard.dismiss();
//           setShowBankForm(false);
//           return true;
//         }

//         // Otherwise allow normal navigation
//         return false;
//       },
//     );

//     return () => backHandler.remove();
//   }, [showBankForm, errorModalVisible]);
//   /*
//    * Convert Cashfree's status into the status used by our UI.
//    */
//   const mapCashfreeStatus = (cfStatus?: string): PaymentStatus => {
//     switch (cfStatus) {
//       case "ACTIVE":
//         return "ACTIVE";

//       case "IN_BENE_CREATION":
//         return "PENDING";

//       case "REJECTED":
//         return "REJECTED";

//       default:
//         return "NOT_CONNECTED";
//     }
//   };

//   /*
//    * Show our custom error modal.
//    */
//   const showPaymentError = (error: any) => {
//     console.log(
//       "Raw payment error:",
//       error?.response?.data || error?.message || error,
//     );

//     const backendError = error?.response?.data;

//     const message =
//       backendError?.message ||
//       error?.message ||
//       "Unable to set up your payout account.";

//     setErrorTitle("Payment setup couldn't be completed");
//     setErrorMessage(String(message));
//     setErrorModalVisible(true);
//   };

//   /*
//    * Load current payout account status.
//    */
//   const loadPaymentStatus = async () => {
//     try {
//       setLoading(true);

//       if (!gym?._id) {
//         setStatus("NOT_CONNECTED");
//         return;
//       }

//       console.log("Checking Cashfree vendor for gym:", gym._id);

//       const response = await getCashfreeVendorStatusApi(gym._id);

//       console.log("Cashfree vendor status:", response);

//       if (!response?.success) {
//         setStatus("NOT_CONNECTED");
//         return;
//       }

//       /*
//        * Cashfree is the source of truth.
//        */
//       const cashfreeStatus = response.status;

//       setStatus(mapCashfreeStatus(cashfreeStatus));
//     } catch (error: any) {
//       console.log(
//         "Cashfree vendor status error:",
//         error?.response?.data || error?.message || error,
//       );

//       /*
//        * If we cannot confirm that a vendor exists,
//        * don't incorrectly show it as connected.
//        */
//       setStatus("NOT_CONNECTED");
//     } finally {
//       setLoading(false);
//     }
//   };
//   // const loadPaymentStatus = async () => {
//   //   try {
//   //     setLoading(true);

//   //     const gymData = await AsyncStorage.getItem("user");

//   //     if (gymData) {
//   //       const storedGym = JSON.parse(gymData);

//   //       console.log(storedGym, "this is gym data");

//   //       setGymName(storedGym.gymName || "Your Gym");

//   //       setStatus(mapCashfreeStatus(storedGym.payoutAccountStatus));
//   //     }

//   //     /*
//   //      * Get the latest status from backend.
//   //      */
//   //     if (gym?._id) {
//   //       const response = await getCashfreeVendorStatusApi(gym._id);

//   //       console.log("Cashfree status response:", response);

//   //       if (response?.success) {
//   //         setStatus(mapCashfreeStatus(response.status));
//   //       }
//   //     }
//   //   } catch (error) {
//   //     console.log("Load payment status error:", error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   /*
//    * Submit bank details to Cashfree.
//    */
//   const submitBankDetails = async () => {
//     if (connecting) return;

//     /*
//      * Make sure gym exists.
//      */
//     if (!gym?._id) {
//       setErrorTitle("Gym information missing");
//       setErrorMessage(
//         "We couldn't find your gym information. Please go back and try again.",
//       );
//       setErrorModalVisible(true);
//       return;
//     }

//     /*
//      * Validate form.
//      */
//     if (
//       !accountHolder.trim() ||
//       !accountNumber.trim() ||
//       !ifsc.trim() ||
//       !panNumber.trim()
//     ) {
//       setErrorTitle("Missing details");
//       setErrorMessage(
//         "Please fill in all the bank and verification details before continuing.",
//       );
//       setErrorModalVisible(true);
//       return;
//     }

//     try {
//       setConnecting(true);

//       console.log("Setting up Cashfree vendor for gym:", gym._id);

//       const response = await setupCashfreeVendorApi(gym._id, {
//         accountHolder: accountHolder.trim(),

//         accountNumber: accountNumber.trim(),

//         ifsc: ifsc.trim().toUpperCase(),

//         panNumber: panNumber.trim().toUpperCase(),

//         name: gym.gymName,

//         email: user?.email,

//         phoneNumber: user?.phone,
//       });

//       console.log("Cashfree vendor response:", response);

//       /*
//        * Backend returned success:false
//        *
//        * Convert the response into the same
//        * format used by our error handler.
//        */
//       if (!response?.success) {
//         showPaymentError({
//           response: {
//             data: response,
//           },
//         });

//         return;
//       }

//       /*
//        * Update status.
//        */
//       setStatus(mapCashfreeStatus(response.vendorStatus));

//       /*
//        * Close bank form.
//        */
//       setShowBankForm(false);

//       /*
//        * Clear entered bank details.
//        */
//       setAccountHolder("");
//       setAccountNumber("");
//       setIfsc("");
//       setPanNumber("");

//       /*
//        * Success message.
//        */
//       Alert.alert(
//         "Details submitted",
//         "Your bank account is being verified. This usually takes a few minutes.",
//         [
//           {
//             text: "Okay",
//             style: "default",
//           },
//         ],
//       );
//     } catch (error: any) {
//       /*
//        * Keep the raw error in console for development.
//        */
//       console.log(
//         "Cashfree vendor setup error:",
//         error?.response?.data || error?.message || error,
//       );

//       /*
//        * Show clean user-facing message.
//        */
//       showPaymentError(error);
//     } finally {
//       setConnecting(false);
//     }
//   };

//   /*
//    * Status text.
//    */
//   const getStatusText = () => {
//     switch (status) {
//       case "ACTIVE":
//         return "Payout account connected";

//       case "PENDING":
//         return "Verification pending";

//       case "REJECTED":
//         return "Verification failed";

//       default:
//         return "Payout account not connected";
//     }
//   };

//   /*
//    * Status dot color.
//    */
//   const getStatusColor = () => {
//     switch (status) {
//       case "ACTIVE":
//         return "#23ee09";

//       case "REJECTED":
//         return "#ff4444";

//       case "PENDING":
//         return "#ffaa00";

//       default:
//         return "#777";
//     }
//   };

//   return (
//     <SafeAreaView
//       edges={["top", "bottom"]}
//       style={{
//         flex: 1,
//         backgroundColor: "#050505",
//       }}
//     >
//       {/* =========================
//           MAIN CONTENT
//       ========================== */}

//       <View
//         style={{
//           flex: 1,
//           paddingHorizontal: 20,
//         }}
//       >
//         {/* BACK BUTTON */}

//         <TouchableOpacity
//           onPress={() => {
//             if (showBankForm) {
//               Keyboard.dismiss();
//               setShowBankForm(false);
//               return;
//             }

//             if (errorModalVisible) {
//               setErrorModalVisible(false);
//               return;
//             }

//             router.back();
//           }}
//           activeOpacity={0.8}
//           style={{
//             width: 42,
//             height: 42,
//             borderRadius: 21,
//             backgroundColor: "#111",
//             alignItems: "center",
//             justifyContent: "center",
//             marginTop: 8,
//           }}
//         >
//           <Ionicons name="chevron-back" size={23} color="white" />
//         </TouchableOpacity>

//         {/* HEADER */}

//         <View
//           style={{
//             marginTop: 35,
//           }}
//         >
//           <Text
//             style={{
//               color: "white",
//               fontSize: 32,
//               fontWeight: "700",
//             }}
//           >
//             Payments
//           </Text>

//           <Text
//             style={{
//               color: "#777",
//               fontSize: 15,
//               lineHeight: 21,
//               marginTop: 8,
//             }}
//           >
//             Add your bank account to receive payments from customers.
//           </Text>
//         </View>

//         {/* PAYMENT ACCOUNT CARD */}

//         <View
//           style={{
//             marginTop: 35,
//             paddingVertical: 22,
//             paddingHorizontal: 20,
//             backgroundColor: "#111",
//             borderRadius: 18,
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//             }}
//           >
//             {/* ICON */}

//             <View
//               style={{
//                 width: 48,
//                 height: 48,
//                 borderRadius: 24,
//                 backgroundColor: "#1A1A1A",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Ionicons name="card-outline" size={23} color="#23ee09" />
//             </View>

//             {/* GYM NAME */}

//             <View
//               style={{
//                 flex: 1,
//                 marginLeft: 14,
//               }}
//             >
//               <Text
//                 style={{
//                   color: "white",
//                   fontSize: 17,
//                   fontWeight: "600",
//                 }}
//                 numberOfLines={1}
//               >
//                 {gym?.gymName || gymName || "Your Gym"}
//               </Text>

//               <Text
//                 style={{
//                   color: "#666",
//                   fontSize: 13,
//                   marginTop: 4,
//                 }}
//               >
//                 Payment account
//               </Text>
//             </View>
//           </View>

//           {/* STATUS */}

//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               marginTop: 20,
//               paddingTop: 16,
//               borderTopWidth: 1,
//               borderTopColor: "#222",
//             }}
//           >
//             <View
//               style={{
//                 width: 8,
//                 height: 8,
//                 borderRadius: 4,
//                 backgroundColor: getStatusColor(),
//               }}
//             />

//             <Text
//               style={{
//                 color: "#aaa",
//                 fontSize: 14,
//                 marginLeft: 9,
//               }}
//             >
//               {getStatusText()}
//             </Text>
//           </View>
//         </View>

//         {/* INFO */}

//         <View
//           style={{
//             marginTop: 18,
//           }}
//         >
//           <Text
//             style={{
//               color: "#666",
//               fontSize: 13,
//               lineHeight: 20,
//             }}
//           >
//             Your customers will pay for gym passes through GymPass. Payments
//             will be settled directly to the bank account below.
//           </Text>
//         </View>
//       </View>

//       {/* =========================
//           BOTTOM BUTTON
//       ========================== */}

//       <View
//         style={{
//           paddingHorizontal: 20,
//           paddingTop: 10,
//           paddingBottom: 8,
//           backgroundColor: "#050505",
//         }}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#23ee09" />
//         ) : (
//           <TouchableOpacity
//             onPress={() => setShowBankForm(true)}
//             disabled={status === "ACTIVE"}
//             activeOpacity={0.85}
//             style={{
//               height: 56,
//               borderRadius: 16,
//               backgroundColor: status === "ACTIVE" ? "#151515" : "#23ee09",
//               alignItems: "center",
//               justifyContent: "center",
//               flexDirection: "row",
//             }}
//           >
//             <Ionicons
//               name={status === "ACTIVE" ? "checkmark-circle" : "card-outline"}
//               size={20}
//               color={status === "ACTIVE" ? "#23ee09" : "#050505"}
//             />

//             <Text
//               style={{
//                 marginLeft: 8,
//                 fontSize: 16,
//                 fontWeight: "700",
//                 color: status === "ACTIVE" ? "#777" : "#050505",
//               }}
//             >
//               {status === "ACTIVE"
//                 ? "Payout Account Connected"
//                 : "Add Bank Account"}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* =========================
//           BANK FORM MODAL
//       ========================== */}

//       <Modal
//         visible={showBankForm}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setShowBankForm(false)}
//       >
//         <KeyboardAvoidingView
//           style={{
//             flex: 1,
//           }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <View
//             style={{
//               flex: 1,
//               backgroundColor: "rgba(0,0,0,0.6)",
//               justifyContent: "flex-end",
//             }}
//           >
//             <View
//               style={{
//                 backgroundColor: "#111",
//                 borderTopLeftRadius: 24,
//                 borderTopRightRadius: 24,
//                 maxHeight: "90%",
//               }}
//             >
//               <ScrollView
//                 keyboardShouldPersistTaps="handled"
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={{
//                   padding: 24,
//                   paddingBottom: 35,
//                 }}
//               >
//                 {/* FORM HEADER */}

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     marginBottom: 20,
//                   }}
//                 >
//                   <View
//                     style={{
//                       width: 44,
//                       height: 44,
//                       borderRadius: 22,
//                       backgroundColor: "#1A1A1A",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <Ionicons name="card-outline" size={22} color="#23ee09" />
//                   </View>

//                   <View
//                     style={{
//                       marginLeft: 12,
//                       flex: 1,
//                     }}
//                   >
//                     <Text
//                       style={{
//                         color: "white",
//                         fontSize: 20,
//                         fontWeight: "700",
//                       }}
//                     >
//                       Add Bank Account
//                     </Text>

//                     <Text
//                       style={{
//                         color: "#666",
//                         fontSize: 12,
//                         marginTop: 3,
//                       }}
//                     >
//                       Enter your account details
//                     </Text>
//                   </View>

//                   {/* CLOSE */}

//                   <TouchableOpacity
//                     onPress={() => setShowBankForm(false)}
//                     style={{
//                       width: 36,
//                       height: 36,
//                       borderRadius: 18,
//                       backgroundColor: "#1A1A1A",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <Ionicons name="close" size={20} color="#777" />
//                   </TouchableOpacity>
//                 </View>

//                 {/* ACCOUNT HOLDER */}

//                 <TextInput
//                   placeholder="Account holder name"
//                   placeholderTextColor="#666"
//                   value={accountHolder}
//                   onChangeText={setAccountHolder}
//                   autoCapitalize="words"
//                   returnKeyType="next"
//                   style={{
//                     backgroundColor: "#1A1A1A",
//                     color: "white",
//                     borderRadius: 12,
//                     paddingHorizontal: 16,
//                     paddingVertical: 14,
//                     marginBottom: 12,
//                     fontSize: 15,
//                     borderWidth: 1,
//                     borderColor: "#222",
//                   }}
//                 />

//                 {/* ACCOUNT NUMBER */}

//                 <TextInput
//                   placeholder="Account number"
//                   placeholderTextColor="#666"
//                   value={accountNumber}
//                   onChangeText={setAccountNumber}
//                   keyboardType="numeric"
//                   returnKeyType="next"
//                   style={{
//                     backgroundColor: "#1A1A1A",
//                     color: "white",
//                     borderRadius: 12,
//                     paddingHorizontal: 16,
//                     paddingVertical: 14,
//                     marginBottom: 12,
//                     fontSize: 15,
//                     borderWidth: 1,
//                     borderColor: "#222",
//                   }}
//                 />

//                 {/* IFSC */}

//                 <TextInput
//                   placeholder="IFSC code"
//                   placeholderTextColor="#666"
//                   value={ifsc}
//                   onChangeText={setIfsc}
//                   autoCapitalize="characters"
//                   returnKeyType="next"
//                   style={{
//                     backgroundColor: "#1A1A1A",
//                     color: "white",
//                     borderRadius: 12,
//                     paddingHorizontal: 16,
//                     paddingVertical: 14,
//                     marginBottom: 12,
//                     fontSize: 15,
//                     borderWidth: 1,
//                     borderColor: "#222",
//                   }}
//                 />

//                 {/* PAN */}

//                 <TextInput
//                   placeholder="PAN number"
//                   placeholderTextColor="#666"
//                   value={panNumber}
//                   onChangeText={setPanNumber}
//                   autoCapitalize="characters"
//                   returnKeyType="done"
//                   style={{
//                     backgroundColor: "#1A1A1A",
//                     color: "white",
//                     borderRadius: 12,
//                     paddingHorizontal: 16,
//                     paddingVertical: 14,
//                     marginBottom: 12,
//                     fontSize: 15,
//                     borderWidth: 1,
//                     borderColor: "#222",
//                   }}
//                 />

//                 {/* SUBMIT */}

//                 <TouchableOpacity
//                   onPress={submitBankDetails}
//                   disabled={connecting}
//                   activeOpacity={0.85}
//                   style={{
//                     height: 54,
//                     borderRadius: 14,
//                     backgroundColor: connecting ? "#1A1A1A" : "#23ee09",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     marginTop: 8,
//                   }}
//                 >
//                   {connecting ? (
//                     <View
//                       style={{
//                         flexDirection: "row",
//                         alignItems: "center",
//                       }}
//                     >
//                       <ActivityIndicator size="small" color="#23ee09" />

//                       <Text
//                         style={{
//                           color: "#777",
//                           fontWeight: "600",
//                           fontSize: 15,
//                           marginLeft: 9,
//                         }}
//                       >
//                         Verifying...
//                       </Text>
//                     </View>
//                   ) : (
//                     <Text
//                       style={{
//                         color: "#050505",
//                         fontWeight: "700",
//                         fontSize: 16,
//                       }}
//                     >
//                       Save & Verify
//                     </Text>
//                   )}
//                 </TouchableOpacity>

//                 {/* CANCEL */}

//                 <TouchableOpacity
//                   onPress={() => setShowBankForm(false)}
//                   style={{
//                     marginTop: 14,
//                     alignItems: "center",
//                     paddingVertical: 8,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: "#777",
//                       fontSize: 14,
//                     }}
//                   >
//                     Cancel
//                   </Text>
//                 </TouchableOpacity>
//               </ScrollView>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* =========================
//           CUSTOM ERROR MODAL
//       ========================== */}

//       <Modal
//         visible={errorModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setErrorModalVisible(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.78)",
//             justifyContent: "center",
//             alignItems: "center",
//             paddingHorizontal: 24,
//           }}
//         >
//           <View
//             style={{
//               width: "100%",
//               backgroundColor: "#111111",
//               borderRadius: 24,
//               padding: 24,
//               borderWidth: 1,
//               borderColor: "#242424",
//             }}
//           >
//             {/* ERROR ICON */}

//             <View
//               style={{
//                 width: 58,
//                 height: 58,
//                 borderRadius: 29,
//                 backgroundColor: "#1A1010",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 marginBottom: 18,
//               }}
//             >
//               <Ionicons name="alert-circle-outline" size={32} color="#ff4d4d" />
//             </View>

//             {/* ERROR TITLE */}

//             <Text
//               style={{
//                 color: "#FFFFFF",
//                 fontSize: 21,
//                 fontWeight: "700",
//                 marginBottom: 10,
//               }}
//             >
//               {errorTitle}
//             </Text>

//             {/* ERROR MESSAGE */}

//             <Text
//               style={{
//                 color: "#A5A5A5",
//                 fontSize: 15,
//                 lineHeight: 22,
//                 marginBottom: 24,
//               }}
//             >
//               {errorMessage}
//             </Text>

//             {/* OKAY BUTTON */}

//             <TouchableOpacity
//               onPress={() => setErrorModalVisible(false)}
//               activeOpacity={0.85}
//               style={{
//                 height: 52,
//                 borderRadius: 14,
//                 backgroundColor: "#23ee09",
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             >
//               <Text
//                 style={{
//                   color: "#000000",
//                   fontSize: 16,
//                   fontWeight: "700",
//                 }}
//               >
//                 Okay
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }
