import {
  deleteCashfreeVendorApi,
  getCashfreeVendorStatusApi,
  setupCashfreeVendorApi,
  updateCashfreeVendorApi,
  type CashfreeVendorDetails,
} from "@/backend/services/paymentService";
import { Screen } from "@/components/layout/screen";
import { useAuth } from "@/context/AuthContext";
import { useGym } from "@/context/GymContext";
import { MAX_FONT_MULTIPLIER } from "@/hooks/use-responsive";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const GREEN = "#23ee09";
const BG = "#050505";
const CARD = "#101010";

type FormDetails = {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  panNumber: string;
};

/** Order the keyboard "next" button moves through. */
const FIELD_ORDER: (keyof FormDetails)[] = [
  "accountHolder",
  "accountNumber",
  "ifsc",
  "panNumber",
];

const EMPTY_FORM: FormDetails = {
  accountHolder: "",
  accountNumber: "",
  ifsc: "",
  panNumber: "",
};

function getStatusDisplay(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return {
        title: "Account active",
        description: "Cashfree reports this vendor as active.",
        color: GREEN,
        icon: "checkmark-circle" as const,
      };

    case "BLOCKED":
      return {
        title: "Account blocked",
        description:
          "Cashfree reports this vendor as blocked. Contact support if you need assistance.",
        color: "#ff6868",
        icon: "alert-circle" as const,
      };

    case "DELETED":
      return {
        title: "Account deleted",
        description: "Cashfree reports this vendor as deleted.",
        color: "#999999",
        icon: "trash-outline" as const,
      };

    default:
      return {
        title: status || "Status unavailable",
        description:
          "This is the status returned by Cashfree. Contact support if you need help interpreting it.",
        color: "#ffbd59",
        icon: "time-outline" as const,
      };
  }
}

export default function SetUpPayment() {
  const { gym } = useGym();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [exists, setExists] = useState(false);
  const [status, setStatus] = useState("NOT_SETUP");
  const [vendorId, setVendorId] = useState("");
  const [statusError, setStatusError] = useState("");
  const [form, setForm] = useState<FormDetails>(EMPTY_FORM);
  const fieldRefs = useRef<
    Partial<Record<keyof FormDetails, TextInput | null>>
  >({});

  const loadStatus = useCallback(async () => {
    if (!gym?._id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatusError("");

    try {
      const result = await getCashfreeVendorStatusApi(gym._id);

      if (!result?.success) {
        throw new Error(result?.message || "Unable to verify Cashfree status.");
      }

      setExists(Boolean(result.exists));
      setStatus(result.status || "UNKNOWN");
      setVendorId(result.vendorId || "");
    } catch (error: any) {
      setStatusError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to check Cashfree status.",
      );
    } finally {
      setLoading(false);
    }
  }, [gym?._id]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const changeField = (key: keyof FormDetails, value: string) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const cancelEditing = () => {
    setEditing(false);
    setForm(EMPTY_FORM);
  };

  const submitDetails = async () => {
    if (!gym?._id || saving) return;

    if (
      !form.accountHolder.trim() ||
      !form.accountNumber.trim() ||
      !form.ifsc.trim() ||
      !form.panNumber.trim() ||
      !user?.email ||
      !user?.phone
    ) {
      Alert.alert(
        "Missing details",
        "Complete all bank fields and ensure your profile has an email and phone number.",
      );
      return;
    }

    const details: CashfreeVendorDetails = {
      name: gym.gymName,
      accountHolder: form.accountHolder.trim(),
      accountNumber: form.accountNumber.trim(),
      ifsc: form.ifsc.trim().toUpperCase(),
      panNumber: form.panNumber.trim().toUpperCase(),
      email: user.email,
      phoneNumber: String(user.phone),
    };

    setSaving(true);

    try {
      const result = editing
        ? await updateCashfreeVendorApi(gym._id, details)
        : await setupCashfreeVendorApi(gym._id, details);

      if (!result?.success) {
        throw new Error(
          result?.message || "Cashfree could not save the details.",
        );
      }

      setEditing(false);
      setForm(EMPTY_FORM);

      await loadStatus();

      Alert.alert(
        editing ? "Details updated" : "Request submitted",
        editing
          ? "Cashfree accepted the vendor update."
          : "Your vendor details were submitted to Cashfree.",
      );
    } catch (error: any) {
      Alert.alert(
        "Unable to save",
        error?.response?.data?.message || error?.message || "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRequest = () => {
    if (!gym?._id || saving) return;

    Alert.alert(
      "Delete account request?",
      "This will ask Cashfree to mark the vendor as DELETED. It may affect future settlements. Continue only if you intend to deactivate this vendor.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSaving(true);

            try {
              const result = await deleteCashfreeVendorApi(gym._id);

              if (!result?.success) {
                throw new Error(
                  result?.message || "Cashfree could not delete the vendor.",
                );
              }

              setEditing(false);
              setForm(EMPTY_FORM);
              await loadStatus();

              Alert.alert(
                "Request updated",
                "Cashfree accepted the vendor status update.",
              );
            } catch (error: any) {
              Alert.alert(
                "Unable to delete",
                error?.response?.data?.message ||
                  error?.message ||
                  "Please try again.",
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const hasRequest = exists && status !== "DELETED";
  const statusInfo = getStatusDisplay(status);

  const renderField = (
    label: string,
    key: keyof FormDetails,
    placeholder: string,
    options: {
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
      keyboardType?: "default" | "number-pad";
      maxLength?: number;
    } = {},
  ) => {
    const nextField = FIELD_ORDER[FIELD_ORDER.indexOf(key) + 1];

    return (
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: "#999",
            fontSize: 11,
            fontWeight: "700",
            marginBottom: 8,
            letterSpacing: 0.7,
          }}
        >
          {label}
        </Text>

        <TextInput
          ref={(ref) => {
            fieldRefs.current[key] = ref;
          }}
          value={form[key]}
          onChangeText={(value) => changeField(key, value)}
          placeholder={placeholder}
          placeholderTextColor="#555"
          editable={!saving}
          autoCapitalize={options.autoCapitalize || "none"}
          keyboardType={options.keyboardType || "default"}
          maxLength={options.maxLength}
          autoCorrect={false}
          returnKeyType={nextField ? "next" : "done"}
          submitBehavior={nextField ? "submit" : "blurAndSubmit"}
          onSubmitEditing={() => {
            if (nextField) fieldRefs.current[nextField]?.focus();
          }}
          maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
          style={{
            minHeight: 52,
            backgroundColor: "#111",
            color: "#fff",
            borderRadius: 13,
            paddingHorizontal: 15,
            borderWidth: 1,
            borderColor: "#292929",
            fontSize: 15,
          }}
        />
      </View>
    );
  };

  return (
    // Top edge only: the tab bar already pads for the home indicator / gesture bar.
    <Screen
      edges={["top"]}
      backgroundColor={BG}
      bottomOffset={32}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 36,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 29,
          fontWeight: "800",
        }}
      >
        Payouts
      </Text>

      <Text
        style={{
          color: "#888",
          fontSize: 14,
          lineHeight: 21,
          marginTop: 7,
          marginBottom: 25,
        }}
      >
        Manage your Cashfree account and bank details.
      </Text>

      {loading ? (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 35,
          }}
        >
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={{ color: "#888", marginTop: 12 }}>
            Checking Cashfree status...
          </Text>
        </View>
      ) : statusError ? (
        <View
          style={{
            backgroundColor: "#1a1010",
            borderWidth: 1,
            borderColor: "#512525",
            borderRadius: 16,
            padding: 18,
            marginBottom: 22,
          }}
        >
          <Text
            style={{
              color: "#ff8888",
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Unable to verify request
          </Text>

          <Text
            style={{
              color: "#bbb",
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            {statusError}
          </Text>

          <TouchableOpacity
            onPress={() => void loadStatus()}
            style={{
              marginTop: 15,
              alignSelf: "flex-start",
              padding: 11,
              backgroundColor: "#292929",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : hasRequest ? (
        // Existing Cashfree vendor/request card
        <View
          style={{
            backgroundColor: CARD,
            borderWidth: 1,
            borderColor: "#292929",
            borderRadius: 20,
            padding: 18,
            marginBottom: 24,
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
                height: 48,
                width: 48,
                borderRadius: 15,
                backgroundColor: "#1d281b",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="card-outline" size={25} color={GREEN} />
            </View>

            <View style={{ flex: 1, marginLeft: 13 }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 17,
                  fontWeight: "800",
                }}
              >
                Account Request Raised
              </Text>

              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {gym?.gymName || "Your gym"}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#191919",
              borderRadius: 14,
              padding: 14,
              marginTop: 18,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <Ionicons
              name={statusInfo.icon}
              size={23}
              color={statusInfo.color}
            />

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={{
                  color: statusInfo.color,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                {statusInfo.title}
              </Text>

              <Text
                style={{
                  color: "#aaa",
                  fontSize: 12,
                  lineHeight: 18,
                  marginTop: 5,
                }}
              >
                {statusInfo.description}
              </Text>

              <Text
                style={{
                  color: "#777",
                  fontSize: 11,
                  marginTop: 8,
                }}
              >
                Cashfree status: {status}
              </Text>
            </View>
          </View>

          {!!vendorId && (
            <Text
              style={{
                color: "#666",
                fontSize: 11,
                marginTop: 12,
              }}
            >
              Vendor reference: {vendorId}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 18,
            }}
          >
            <TouchableOpacity
              disabled={saving}
              onPress={() => {
                setForm(EMPTY_FORM);
                setEditing(true);
              }}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 13,
                backgroundColor: GREEN,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: saving ? 0.5 : 1,
              }}
            >
              <Ionicons name="create-outline" size={18} color="#050505" />
              <Text
                style={{
                  color: "#050505",
                  fontWeight: "800",
                  marginLeft: 7,
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={saving}
              onPress={deleteRequest}
              style={{
                minHeight: 48,
                paddingHorizontal: 14,
                borderRadius: 13,
                backgroundColor: "#211111",
                borderWidth: 1,
                borderColor: "#512525",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: saving ? 0.5 : 1,
              }}
            >
              <Ionicons name="trash-outline" size={17} color="#ff7777" />
              <Text
                style={{
                  color: "#ff7777",
                  fontWeight: "700",
                  marginLeft: 6,
                }}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: CARD,
            borderWidth: 1,
            borderColor: "#292929",
            borderRadius: 18,
            padding: 18,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 17,
              fontWeight: "800",
            }}
          >
            {status === "DELETED"
              ? "Previous request deleted"
              : "No active account request"}
          </Text>

          <Text
            style={{
              color: "#888",
              fontSize: 13,
              lineHeight: 20,
              marginTop: 7,
            }}
          >
            Submit your bank details to create a Cashfree vendor account.
          </Text>
        </View>
      )}

      {(!hasRequest || editing) && !statusError && (
        <View>
          <Text
            style={{
              color: "#fff",
              fontSize: 19,
              fontWeight: "800",
              marginBottom: 7,
            }}
          >
            {editing ? "Edit account details" : "Bank details"}
          </Text>

          <Text
            style={{
              color: "#888",
              fontSize: 13,
              lineHeight: 20,
              marginBottom: 20,
            }}
          >
            {editing
              ? "Enter the corrected details. For security, existing bank and PAN details are not prefilled."
              : "Enter the bank details to register with Cashfree."}
          </Text>

          {renderField(
            "ACCOUNT HOLDER NAME",
            "accountHolder",
            "Name as shown on bank account",
            { autoCapitalize: "words" },
          )}

          {renderField(
            "ACCOUNT NUMBER",
            "accountNumber",
            "Enter account number",
            { keyboardType: "number-pad" },
          )}

          {renderField("IFSC CODE", "ifsc", "Enter IFSC code", {
            autoCapitalize: "characters",
            maxLength: 11,
          })}

          {renderField("PAN NUMBER", "panNumber", "Enter PAN number", {
            autoCapitalize: "characters",
            maxLength: 10,
          })}

          <TouchableOpacity
            onPress={submitDetails}
            disabled={saving}
            style={{
              minHeight: 54,
              borderRadius: 15,
              backgroundColor: saving ? "#252525" : GREEN,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              marginTop: 3,
            }}
          >
            {saving ? (
              <ActivityIndicator color={GREEN} />
            ) : (
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color="#050505"
              />
            )}

            <Text
              style={{
                color: saving ? "#aaa" : "#050505",
                fontWeight: "800",
                fontSize: 15,
                marginLeft: 8,
              }}
            >
              {saving
                ? "Please wait..."
                : editing
                  ? "Save changes"
                  : "Submit account request"}
            </Text>
          </TouchableOpacity>

          {editing && (
            <TouchableOpacity
              onPress={cancelEditing}
              style={{
                alignItems: "center",
                paddingVertical: 16,
              }}
            >
              <Text
                style={{
                  color: "#999",
                  fontWeight: "700",
                }}
              >
                Cancel editing
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginTop: 22,
        }}
      >
        <Ionicons name="lock-closed-outline" size={15} color="#555" />
        <Text
          style={{
            color: "#666",
            fontSize: 12,
            lineHeight: 18,
            marginLeft: 8,
            flex: 1,
          }}
        >
          Your bank details are sent to your backend and Cashfree using
          authenticated requests. Keep Cashfree API credentials on the backend
          only.
        </Text>
      </View>
    </Screen>
  );
}
