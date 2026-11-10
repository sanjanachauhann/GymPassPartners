import { MAX_CONTENT_WIDTH } from "@/hooks/use-responsive";
import { ReactNode } from "react";
import { Modal, Pressable, StyleProp, View, ViewStyle } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomSheetModalProps = {
  visible: boolean;
  /** Called on backdrop tap and Android back button. */
  onClose: () => void;
  children: ReactNode;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  /** Close when the dimmed area is tapped (default: true). */
  dismissOnBackdropPress?: boolean;
};

/**
 * A bottom sheet that slides up together with the keyboard on both iOS and
 * Android, so inputs inside it are never hidden.
 */
export function BottomSheetModal({
  visible,
  onClose,
  children,
  backgroundColor = "#111",
  contentStyle,
  dismissOnBackdropPress = true,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      // Needed on Android so the modal is edge-to-edge and keyboard insets are reported.
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView
        behavior="padding"
        // The keyboard covers the home-indicator area, so don't double count it.
        keyboardVerticalOffset={insets.bottom}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={{ flex: 1 }}
          onPress={dismissOnBackdropPress ? onClose : undefined}
        />

        <View
          style={[
            {
              width: "100%",
              maxWidth: MAX_CONTENT_WIDTH,
              alignSelf: "center",
              backgroundColor,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 24 + insets.bottom,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
