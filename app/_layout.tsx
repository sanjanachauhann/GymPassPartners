import { AuthProvider } from "@/context/AuthContext";
import { GymProvider } from "@/context/GymContext";
import { GymRegistrationProvider } from "@/context/GymRegistration";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}
