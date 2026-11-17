import { AuthProvider } from "@/context/AuthContext";
import { GymProvider } from "@/context/GymContext";
import { GymRegistrationProvider } from "@/context/GymRegistration";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <AuthProvider>
        <GymRegistrationProvider>
          <GymProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="location-picker" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="gymdetails" />
              <Stack.Screen name="setup-password" />
              <Stack.Screen name="success-req" />
            </Stack>
          </GymProvider>
        </GymRegistrationProvider>
      </AuthProvider>
    </KeyboardProvider>
  );
}
