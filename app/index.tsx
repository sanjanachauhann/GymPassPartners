// import { getGymRequest } from "@/backend/middleware/gymPartnerMiddleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { router } from "expo-router";
// import { useEffect } from "react";
// import { ActivityIndicator, View } from "react-native";

// export default function Index() {
//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     //   const token = await AsyncStorage.getItem("token");

//     //   if (token) {
//     //     router.replace("/(tabs)");
//     //   } else {
//     //     router.replace("/login");
//     //   }
//     // };

//     const request = await AsyncStorage.getItem("gymRequest");

//     if (request) {
//       const req = await getGymRequest(request.id);

//       router.replace("/request-success");
//       return;
//     }

//     const token = await AsyncStorage.getItem("token");

//     if (token) {
//       router.replace("/(tabs)");
//       return;
//     }
//     router.replace("/login");
//   };

//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: "#050505",
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <ActivityIndicator size="large" color="#23ee09" />
//     </View>
//   );
// }
import { getGymRequest } from "@/backend/middleware/gymPartnerMiddleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

export default function Index() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if a gym registration request exists
      const savedRequest = await AsyncStorage.getItem("gymRequest");

      if (savedRequest) {
        const localRequest = JSON.parse(savedRequest);

        const response = await getGymRequest(localRequest.requestId);

        if (response.success) {
          const request = response.request;

          // Update local cache with latest data
          await AsyncStorage.setItem(
            "gymRequest",
            JSON.stringify({
              requestId: request._id,
              gymName: request.gymName,
              status: request.status,
            }),
          );

          if (request.status === "pending") {
            router.replace("/success_req");
            return;
          }

          // if (request.status === "approved") {
          //   // Later you'll save the partner token here
          //   await AsyncStorage.removeItem("gymRequest");
          //   router.replace("/login");
          //   return;
          // }

          if (request.status === "approved") {
            // Save email for login screen
            await AsyncStorage.setItem(
              "lastActivatedPartner",
              JSON.stringify({
                email: request.email,
              }),
            );

            router.replace("/success_req");

            return;
          }

          // if (request.status === "rejected") {
          //   // router.replace("/request-success");
          //   Alert.alert(
          //     "Your request has been rejected. Kindly contact helpdesk.",
          //   );

          //   return;
          // }

          if (request.status === "rejected") {
            // Clear the rejected registration request
            await AsyncStorage.removeItem("gymRequest");
            await AsyncStorage.removeItem("pendingPartner");
            await AsyncStorage.removeItem("lastActivatedPartner");

            Alert.alert(
              "Application Rejected",
              "Your gym registration request was rejected. Please contact the helpdesk for assistance.",
              [
                {
                  text: "OK",
                  onPress: () => router.replace("/login"),
                },
              ],
            );

            return;
          }
        }
      }

      // No pending request, check login
      const token = await AsyncStorage.getItem("token");

      if (token) {
        router.replace("/(tabs)");
        return;
      }
      router.replace("/login");
    } catch (error) {
      console.log(error);
      router.replace("/login");
    }
  };

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
    </View>
  );
}
