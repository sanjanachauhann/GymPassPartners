import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useRef, useState } from "react";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { useGymRegistration } from "@/context/GymRegistration";
import { SafeAreaView } from "react-native-safe-area-context";

type FieldName = "name" | "email" | "phone" | "password";

const getSignupErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return "We could not create your account right now. Please check your details and try again.";
};

export default function Signup() {
  // INPUT STATES

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const { setUser, setToken } = useAuth();

  const scrollViewRef = useRef<ScrollView>(null);

  const inputRefs = useRef<Record<FieldName, TextInput | null>>({
    name: null,
    email: null,
    phone: null,
    password: null,
  });

  // ANIMATIONS
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(40)).current;

  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),

        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const focusInputInView = (field: FieldName) => {
    const input = inputRefs.current[field];

    if (!input) {
      return;
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
        input,
        120,
        true,
      );
    }, 80);
  };

  // SIGNUP FUNCTION
  // const signup = async () => {
  //   if (isSubmitting) {
  //     return;
  //   }

  //   setErrorMessage("");

  //   // VALIDATION
  //   if (!name || !email || !phone || !password) {
  //     setErrorMessage(
  //       "Please fill in all fields before creating your account.",
  //     );

  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);
  //     console.log("Iam here");
  //     const data = await signupUser(name, email, phone, password);

  //     // const data = await createGymPartnerReq(name, email, phone, password);

  //     // SAVE TOKEN
  //     await AsyncStorage.setItem("token", data.token);

  //     // SAVE USER
  //     await AsyncStorage.setItem("partner", JSON.stringify(data.user));

  //     //set user in Auth provider
  //     setUser(data.user);
  //     setToken(data.token);

  //     // NAVIGATE
  //     // router.replace("/(tabs)");
  //     router.replace("/gymdetails");
  //     console.log("STEP 1");
  //   } catch (error) {
  //     console.log(error);

  //     setErrorMessage(getSignupErrorMessage(error));
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const { setRegistration } = useGymRegistration();

  const raiseReq = async () => {
    setRegistration((prev) => ({
      ...prev,
      ownerName: name,
      email,
      phone,
      password,
    }));

    router.push({
      pathname: "/gymdetails",
      params: {
        ownerName: name,
        email,
        phone,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050505" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#050505",
              justifyContent: "center",
              paddingVertical: 24,
            }}
          >
            {/* GLOW */}
            <Animated.View
              style={{
                position: "absolute",
                width: "20%",
                height: "10%",
                borderRadius: "40%",
                backgroundColor: "#23ee09",
                alignSelf: "center",
                opacity: glowAnim.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [0.08, 0.16],
                }),
              }}
            />

            {/* CARD */}
            <Animated.View
              style={{
                backgroundColor: "#0D0D0D",
                borderRadius: 34,
                padding: 30,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.05)",
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim,
                  },
                ],
              }}
            >
              {/* ICON */}
              {/* <View
                style={{
                  width: "20%",
                  height: "10%",
                  borderRadius: "40%",
                  backgroundColor: "rgba(0,245,212,0.12)",
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                <Ionicons name="person-add" size={30} color="#23ee09" />
              </View> */}

              {/* TITLE */}
              <Text
                style={{
                  color: "white",
                  fontSize: 26,
                  fontWeight: "bold",
                  textAlign: "center",
                  // marginTop: 28,
                }}
              >
                {/* Create Account */}
                Enter gym details
              </Text>

              {/* SUBTITLE */}
              <Text
                style={{
                  color: "#777",
                  textAlign: "center",
                  marginTop: 10,
                  lineHeight: 22,
                  fontSize: 13,
                }}
              >
                Join GymPass and access gyms{"\n"}
                around you instantly.
              </Text>

              {/* NAME */}
              <View style={{ marginTop: 34 }}>
                <Text
                  style={{
                    color: "#777",
                    marginBottom: 10,
                    fontSize: 14,
                  }}
                >
                  Owner Full Name
                </Text>

                <View
                  style={{
                    backgroundColor: "#181818",
                    borderRadius: 18,
                    paddingHorizontal: 18,
                    paddingVertical: 16,

                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#23ee09" />

                  <TextInput
                    ref={(ref) => {
                      inputRefs.current.name = ref;
                    }}
                    value={name}
                    editable={!isSubmitting}
                    onFocus={() => focusInputInView("name")}
                    onChangeText={(text) => {
                      setName(text);
                      setErrorMessage("");
                      focusInputInView("name");
                    }}
                    placeholder="Enter full name"
                    placeholderTextColor="#666"
                    returnKeyType="next"
                    onSubmitEditing={() => inputRefs.current.email?.focus()}
                    style={{
                      flex: 1,
                      color: "white",
                      marginLeft: 12,
                      fontSize: 16,
                    }}
                  />
                </View>
              </View>

              {/* EMAIL */}
              <View style={{ marginTop: 22 }}>
                <Text
                  style={{
                    color: "#777",
                    marginBottom: 10,
                    fontSize: 14,
                  }}
                >
                  Email Address
                </Text>

                <View
                  style={{
                    backgroundColor: "#181818",
                    borderRadius: 18,
                    paddingHorizontal: 18,
                    paddingVertical: 16,

                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="#23ee09" />

                  <TextInput
                    ref={(ref) => {
                      inputRefs.current.email = ref;
                    }}
                    value={email}
                    editable={!isSubmitting}
                    onFocus={() => focusInputInView("email")}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrorMessage("");
                      focusInputInView("email");
                    }}
                    placeholder="Enter email"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => inputRefs.current.phone?.focus()}
                    style={{
                      flex: 1,
                      color: "white",
                      marginLeft: 12,
                      fontSize: 16,
                    }}
                  />
                </View>
              </View>

              {/* PHONE */}
              <View style={{ marginTop: 22 }}>
                <Text
                  style={{
                    color: "#777",
                    marginBottom: 10,
                    fontSize: 14,
                  }}
                >
                  Phone Number
                </Text>

                <View
                  style={{
                    backgroundColor: "#181818",
                    borderRadius: 18,
                    paddingHorizontal: 18,
                    paddingVertical: 16,

                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="call-outline" size={20} color="#23ee09" />

                  <TextInput
                    ref={(ref) => {
                      inputRefs.current.phone = ref;
                    }}
                    value={phone}
                    editable={!isSubmitting}
                    onFocus={() => focusInputInView("phone")}
                    onChangeText={(text) => {
                      setPhone(text);
                      setErrorMessage("");
                      focusInputInView("phone");
                    }}
                    placeholder="Enter phone number"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => inputRefs.current.password?.focus()}
                    style={{
                      flex: 1,
                      color: "white",
                      marginLeft: 12,
                      fontSize: 16,
                    }}
                  />
                </View>
              </View>

              {/* PASSWORD */}
              {/* <View style={{ marginTop: 22 }}>
                <Text
                  style={{
                    color: "#777",
                    marginBottom: 10,
                    fontSize: 14,
                  }}
                >
                  Password
                </Text>

                <View
                  style={{
                    backgroundColor: "#181818",
                    borderRadius: 18,
                    paddingHorizontal: 18,
                    paddingVertical: 16,

                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#23ee09"
                  />

                  <TextInput
                    ref={(ref) => {
                      inputRefs.current.password = ref;
                    }}
                    value={password}
                    editable={!isSubmitting}
                    onFocus={() => focusInputInView("password")}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMessage("");
                      focusInputInView("password");
                    }}
                    placeholder="Enter password"
                    placeholderTextColor="#666"
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={signup}
                    style={{
                      flex: 1,
                      color: "white",
                      marginLeft: 12,
                      fontSize: 16,
                    }}
                  />
                </View>
              </View> */}

              {errorMessage ? (
                <Animated.View
                  style={{
                    marginTop: 24,
                    backgroundColor: "rgba(255,78,104,0.12)",
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: "rgba(255,78,104,0.35)",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: "rgba(255,78,104,0.18)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="alert-circle" size={18} color="#FF6B7A" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      Signup failed
                    </Text>

                    <Text
                      style={{
                        color: "#FFB3BC",
                        fontSize: 13,
                        lineHeight: 19,
                        marginTop: 4,
                      }}
                    >
                      {errorMessage}
                    </Text>
                  </View>
                </Animated.View>
              ) : null}

              {/* SIGNUP BUTTON */}
              <TouchableOpacity
                // onPress={signup}
                onPress={raiseReq}
                disabled={isSubmitting}
                activeOpacity={0.85}
                style={{
                  marginTop: 34,
                  backgroundColor: "#23ee09",
                  opacity: isSubmitting ? 0.72 : 1,

                  paddingVertical: 18,
                  borderRadius: 22,

                  justifyContent: "center",
                  alignItems: "center",

                  flexDirection: "row",
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#050505" />
                ) : (
                  <Ionicons name="sparkles-outline" size={20} color="#050505" />
                )}

                <Text
                  style={{
                    color: "#050505",
                    fontSize: 17,
                    fontWeight: "bold",
                    marginLeft: 10,
                  }}
                >
                  {isSubmitting ? "Raising request..." : "Raise request"}
                </Text>
              </TouchableOpacity>

              {/* LOGIN LINK */}
              <TouchableOpacity
                onPress={() => router.push("/login")}
                activeOpacity={0.8}
                style={{
                  marginTop: 22,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#777",
                    fontSize: 14,
                  }}
                >
                  Already have an account?{" "}
                  <Text
                    style={{
                      color: "#23ee09",
                      fontWeight: "600",
                    }}
                  >
                    Login
                  </Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
