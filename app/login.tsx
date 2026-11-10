import {
  Alert,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useRef, useState } from "react";

import { loginUser } from "../backend/services/authService";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { Screen } from "@/components/layout/screen";
import { MAX_FONT_MULTIPLIER, useResponsive } from "@/hooks/use-responsive";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const { setUser, setToken } = useAuth();
  const { scale, fontSize, gutter, isSmallPhone } = useResponsive();
  const passwordRef = useRef<TextInput>(null);

  // INPUT STATES
  const [email, setEmail] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");

  // ANIMATIONS
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(50)).current;

  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // FADE + SLIDE
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // GLOW LOOP
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

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const data = await AsyncStorage.getItem("lastActivatedPartner");

        if (!data) return;

        const partner = JSON.parse(data);

        setEmail(partner.email);
      } catch (err) {
        console.log(err);
      }
    };

    loadEmail();
  }, []);

  const loginFunction = async () => {
    // const { setUser, setToken } = useAuth();

    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter email and password");
      return;
    }

    try {
      const data = await loginUser(email, password);

      await setToken(data.token);
      await setUser(data.user);

      await AsyncStorage.removeItem("lastActivatedPartner");

      router.replace("/(tabs)");

      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);

      const message = error?.response?.data?.message;

      if (message === "Please activate your account first.") {
        Alert.alert(
          "Account Activation Required",
          "Your gym has been approved. Please create a password before logging in.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Create Password",
              onPress: () => {
                router.push({
                  pathname: "/setupPassword" as any,
                  params: {
                    email,
                  },
                });
              },
            },
          ],
        );

        return;
      }

      Alert.alert("Login Failed", message || "Invalid email or password");
    }
  };

  return (
    <Screen
      centerContent
      contentContainerStyle={{
        alignItems: "center",
        paddingHorizontal: gutter,
        paddingVertical: 24,
      }}
    >
      {/* BACKGROUND GLOW */}
      <Animated.View
        style={{
          position: "absolute",
          width: scale(320),
          height: scale(320),
          borderRadius: scale(160),
          backgroundColor: "#23ee09",
          opacity: glowAnim.interpolate({
            inputRange: [0.5, 1],
            outputRange: [0.08, 0.18],
          }),
        }}
      />

      {/* CARD */}
      <Animated.View
        style={{
          width: "100%",
          backgroundColor: "#0D0D0D",
          borderRadius: 36,
          padding: isSmallPhone ? 22 : 30,
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
        <View
          style={{
            width: scale(95),
            height: scale(95),
            borderRadius: scale(48),
            backgroundColor: "rgba(0,245,212,0.12)",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Ionicons name="barbell" size={scale(44)} color="#23ee09" />
        </View>
        {/* TITLE */}
        <Text
          maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
          adjustsFontSizeToFit
          numberOfLines={2}
          style={{
            color: "white",
            fontSize: fontSize(38),
            fontWeight: "bold",
            textAlign: "center",
            marginTop: isSmallPhone ? 20 : 30,
          }}
        >
          GymPass Partners
        </Text>
        {/* SUBTITLE */}
        <Text
          style={{
            color: "#777",
            fontSize: 16,
            textAlign: "center",
            marginTop: 12,
            lineHeight: 24,
          }}
        >
          Verify passes instantly,{"\n"}
          manage members effortlessly.
        </Text>
        {/* EMAIL INPUT */}
        <View
          style={{
            marginTop: 35,
            backgroundColor: "#111",
            borderRadius: 22,
            paddingHorizontal: 18,
            paddingVertical: 16,

            flexDirection: "row",
            alignItems: "center",

            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Ionicons name="mail-outline" size={20} color="#23ee09" />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
            maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
            style={{
              flex: 1,
              color: "white",
              marginLeft: 12,
              fontSize: 16,
            }}
          />
        </View>
        {/* PASSWORD INPUT */}
        <View
          style={{
            marginTop: 18,
            backgroundColor: "#111",
            borderRadius: 22,
            paddingHorizontal: 18,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#23ee09" />

          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#666"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={loginFunction}
            maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
            style={{
              flex: 1,
              color: "white",
              marginLeft: 12,
              fontSize: 16,
            }}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={22}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>
        {/* LOGIN BUTTON */}
        <TouchableOpacity
          onPress={loginFunction}
          activeOpacity={0.85}
          style={{
            // backgroundColor: "#23ee09",
            backgroundColor: "#23ee09",
            marginTop: 32,
            paddingVertical: 18,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Ionicons name="log-in-outline" size={20} color="#050505" />

          <Text
            style={{
              color: "#050505",
              fontSize: 17,
              fontWeight: "bold",
              marginLeft: 10,
            }}
          >
            Login
          </Text>
        </TouchableOpacity>
        {/* SIGNUP BUTTON */}
        <TouchableOpacity
          onPress={() => router.push("/signup")}
          activeOpacity={0.85}
          style={{
            marginTop: 18,
            paddingVertical: 18,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            borderWidth: 1,
            borderColor: "rgba(0, 245, 0, 0.452)",
            backgroundColor: "rgba(0,245,212,0.06)",
          }}
        >
          <Ionicons name="person-add-outline" size={20} color="#23ee09" />

          <Text
            style={{
              color: "#23ee09",
              fontSize: 17,
              fontWeight: "bold",
              marginLeft: 10,
            }}
          >
            Create Account
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* FOOTER */}
      <Text
        style={{
          color: "#555",
          marginTop: 30,
          fontSize: 13,
          textAlign: "center",
        }}
      >
        Your digital gym membership experience
      </Text>
    </Screen>
  );
}
