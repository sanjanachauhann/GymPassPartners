import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  deleteAccount,
  updateProfile,
} from "../../backend/middleware/userMiddleware";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.ownerName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileImage, setProfileImage] = useState(
    user?.photo || "https://i.pravatar.cc/300",
  );

  console.log("profile", user);
  const displayName =
    name.length > 12 ? `${name.substring(0, 12)}...` : name || "";

  useEffect(() => {
    if (user) {
      setName(user.ownerName);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);

      // const response = await updateProfile({
      //   name: trimmedName,
      //   email: trimmedEmail,
      //   phone: trimmedPhone,
      // });

      // Support either { user: {...} } or a direct user object.
      // const updatedUser = response?.user ?? response;

      // if (!updatedUser?._id) {
      //   throw new Error("The server did not return the updated user.");
      // }
      const response = await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        photo: profileImage,
      });

      const updatedUser = response.user ?? response;

      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Success", "Profile updated successfully.");
      setUser(updatedUser);

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setName(updatedUser.ownerName ?? updatedUser.name ?? trimmedName);
      setEmail(updatedUser.email ?? trimmedEmail);
      setPhone(updatedUser.phone ?? trimmedPhone);

      Alert.alert("Success", "Your profile has been updated.");
    } catch (err: any) {
      console.error(
        "Update profile failed:",
        err?.response?.data ?? err?.message ?? err,
      );

      Alert.alert(
        "Update Failed",
        err?.response?.data?.message ??
          err?.message ??
          "Could not update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ],
    );
  };

  // const confirmDelete = async () => {
  //   try {
  //     await deleteAccount();

  //     await AsyncStorage.multiRemove(["token", "user"]);

  //     router.replace("/login");
  //   } catch (err) {
  //     console.log(err);

  //     Alert.alert("Error", "Failed to delete account.");
  //   }
  // };
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);

      await deleteAccount();

      // Clear the authentication session after the server confirms deletion.
      await logout();

      router.replace("/login");
    } catch (err: any) {
      console.error(
        "Delete account failed:",
        err?.response?.data ?? err?.message ?? err,
      );

      Alert.alert(
        "Deletion Failed",
        err?.response?.data?.message ??
          "Your account could not be deleted. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const changePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#050505",
      }}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView style={{ paddingHorizontal: 20 }}>
        {/* HEADER */}
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: "bold",
            }}
          >
            Profile
          </Text>

          <Text
            style={{
              color: "#777",
              marginTop: 8,
              fontSize: 13,
            }}
          >
            Manage your personal information
          </Text>
        </View>

        {/* PROFILE CARD */}
        <View
          style={{
            marginTop: 30,
            backgroundColor: "#111",
            borderRadius: 32,
            padding: 24,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {/* PROFILE TOP */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* PROFILE IMAGE */}
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: "#23ee09",
              }}
            >
              <Ionicons
                name="person"
                size={28}
                color="#23ee09"
                style={{
                  alignSelf: "center",
                  flex: 1,
                  verticalAlign: "middle",
                }}
              />
            </View>

            {/* USER INFO */}
            <View style={{ marginLeft: 18 }}>
              <Text
                style={{
                  color: "white",
                  fontSize: 22,
                  fontWeight: "700",
                }}
              >
                {displayName}
              </Text>

              <Text
                style={{
                  color: "#777",
                  marginTop: 6,
                  fontSize: 12,
                }}
              >
                Premium Member
              </Text>
              {/* CHANGE PHOTO */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  marginTop: 14,
                  backgroundColor: "rgba(0,245,212,0.12)",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                }}
                onPress={changePhoto}
              >
                <Ionicons name="camera" size={16} color="#23ee09" />

                <Text
                  style={{
                    color: "#23ee09",
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  Change Photo
                </Text>
              </TouchableOpacity>
              {/* LOGOUT BUTTON */}
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.85}
                style={{
                  marginTop: 12,
                  backgroundColor: "rgba(255,77,77,0.12)",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  borderWidth: 1,
                  borderColor: "rgba(255,77,77,0.15)",
                }}
              >
                <Ionicons name="log-out-outline" size={16} color="#FF4D4D" />

                <Text
                  style={{
                    color: "#FF4D4D",
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* FORM */}
          <View style={{ marginTop: 35 }}>
            {/* NAME */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#777",
                  marginBottom: 10,
                  fontSize: 12,
                }}
              >
                Full Name
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
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter name"
                  placeholderTextColor="#777"
                  style={{
                    flex: 1,
                    color: "white",
                    marginLeft: 14,
                    fontSize: 14,
                  }}
                />
              </View>
            </View>

            {/* EMAIL */}
            <View style={{ marginBottom: 24 }}>
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
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email"
                  placeholderTextColor="#777"
                  keyboardType="email-address"
                  style={{
                    flex: 1,
                    color: "white",
                    marginLeft: 14,
                    fontSize: 14,
                  }}
                />
              </View>
            </View>

            {/* PHONE */}
            <View>
              <Text
                style={{
                  color: "#777",
                  marginBottom: 10,
                  fontSize: 12,
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
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone"
                  placeholderTextColor="#777"
                  keyboardType="phone-pad"
                  style={{
                    flex: 1,
                    color: "white",
                    marginLeft: 14,
                    fontSize: 14,
                  }}
                />
              </View>
            </View>
          </View>

          {/* SAVE BUTTON */}
          {/* <TouchableOpacity
            activeOpacity={0.85}
            style={{
              marginTop: 34,
              backgroundColor: "#23ee09",
              paddingVertical: 18,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
            onPress={saveProfile}
          >
            <Ionicons name="save-outline" size={20} color="#050505" />

            <Text
              style={{
                color: "#050505",
                fontWeight: "bold",
                fontSize: 14,
                marginLeft: 10,
              }}
            >
              Save Changes
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={saving}
            style={{
              marginTop: 34,
              backgroundColor: saving ? "#75a86e" : "#23ee09",
              paddingVertical: 18,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              opacity: saving ? 0.7 : 1,
            }}
            onPress={saveProfile}
          >
            <Ionicons name="save-outline" size={20} color="#050505" />

            <Text
              style={{
                color: "#050505",
                fontWeight: "bold",
                fontSize: 14,
                marginLeft: 10,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
          {/* DELETE ACCOUNT */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              marginTop: 18,
              backgroundColor: "rgba(255,0,0,0.12)",
              paddingVertical: 18,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              borderWidth: 1,
              borderColor: "rgba(255,0,0,0.15)",
            }}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4D4D" />

            <Text
              style={{
                color: "#FF4D4D",
                fontWeight: "bold",
                fontSize: 14,
                marginLeft: 10,
              }}
            >
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </SafeAreaView>
    </ScrollView>
  );
}
