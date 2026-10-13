import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { setupPassword } from "../backend/services/authService";

export default function SetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasLength = password.length >= 8;

  const strength = [hasUpperCase, hasNumber, hasSpecial, hasLength].filter(
    Boolean,
  ).length;

  const handleActivate = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (strength < 4) {
      Alert.alert("Weak Password", "Password must satisfy all requirements.");
      return;
    }
    // const savedRequest = await AsyncStorage.getItem("gymRequest");
    // const request = JSON.parse(savedRequest);
    // const email = request.email;

    // console.log("hiiiii", email);

    try {
      setLoading(true);
      const savedRequest = await AsyncStorage.getItem("gymRequest");

      if (!savedRequest) {
        Alert.alert("Error", "Unable to find your registration details.");
        return;
      }

      const request = JSON.parse(savedRequest);
      const email = request.email;
      console.log("xyswjbswofo", email);

      await setupPassword(email, password);
      //once done
      await AsyncStorage.setItem(
        "lastActivatedPartner",
        JSON.stringify({ email }),
      );

      await AsyncStorage.removeItem("gymRequest");
      Alert.alert(
        "Account Activated",
        "Your password has been created successfully. You can now log in.",
        [
          {
            text: "Continue",
            onPress: () =>
              router.replace({
                pathname: "/login",
                params: { email },
              }),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        "Activation Failed",
        err?.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>🏋️</Text>

        <Text style={styles.title}>Welcome to GymPass</Text>

        <Text style={styles.subtitle}>
          Your gym has been approved.
          {"\n"}
          Create a password to activate your account.
        </Text>

        {/* Password */}

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#8AFF00" />

          <TextInput
            placeholder="New Password"
            placeholderTextColor="#777"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm */}

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#8AFF00" />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#777"
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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

        {/* Strength */}

        <View style={{ marginTop: 20 }}>
          <Text style={styles.check}>
            {hasLength ? "✅" : "⭕"} Minimum 8 characters
          </Text>

          <Text style={styles.check}>
            {hasUpperCase ? "✅" : "⭕"} One uppercase letter
          </Text>

          <Text style={styles.check}>{hasNumber ? "✅" : "⭕"} One number</Text>

          <Text style={styles.check}>
            {hasSpecial ? "✅" : "⭕"} One special character
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleActivate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Activate Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#181818",
    borderRadius: 22,
    padding: 25,
  },

  logo: {
    fontSize: 60,
    textAlign: "center",
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 15,
  },

  subtitle: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 35,
    lineHeight: 22,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 18,
    height: 60,
  },

  input: {
    flex: 1,
    color: "white",
    marginLeft: 12,
    fontSize: 16,
  },

  check: {
    color: "#ddd",
    marginBottom: 8,
    fontSize: 14,
  },

  button: {
    backgroundColor: "#8AFF00",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    marginTop: 30,
  },

  buttonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 18,
  },
});
