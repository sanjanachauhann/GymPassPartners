import { MAX_CONTENT_WIDTH } from "@/hooks/use-responsive";
import { ReactElement, ReactNode, Ref, useState } from "react";
import {
  RefreshControlProps,
  ScrollViewProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import {
  Edge,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a keyboard-aware ScrollView (default: true). */
  scroll?: boolean;
  /**
   * Safe-area edges to pad. Use `["top"]` inside tab screens, because the
   * tab bar already handles the bottom inset.
   */
  edges?: Edge[];
  backgroundColor?: string;
  /** Style for the scroll content (or the inner view when `scroll` is false). */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Vertically centre content when it is shorter than the screen. */
  centerContent?: boolean;
  /** Content pinned to the bottom (e.g. a primary button). Rides above the keyboard. */
  footer?: ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  /** Max content width for tablets. Pass `null` to allow full width. */
  maxWidth?: number | null;
  refreshControl?: ReactElement<RefreshControlProps>;
  scrollRef?: Ref<KeyboardAwareScrollViewRef>;
  /** Gap kept between the focused input and the keyboard. */
  bottomOffset?: number;
  scrollProps?: Omit<
    ScrollViewProps,
    "contentContainerStyle" | "refreshControl" | "children"
  >;
};

/**
 * One wrapper for every screen:
 * - respects notches, Dynamic Island, status bars and gesture bars on iOS + Android
 * - scrolls the focused TextInput into view above the keyboard on both platforms
 * - caps content width so layouts don't stretch on tablets
 */
export function Screen({
  children,
  scroll = true,
  edges = ["top", "bottom"],
  backgroundColor = "#050505",
  contentContainerStyle,
  centerContent = false,
  footer,
  footerStyle,
  maxWidth,
  refreshControl,
  scrollRef,
  bottomOffset = 24,
  scrollProps,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);

  const padBottom = edges.includes("bottom");
  const widthLimit =
    maxWidth === null ? undefined : (maxWidth ?? MAX_CONTENT_WIDTH);
  const widthStyle: ViewStyle = {
    width: "100%",
    maxWidth: widthLimit,
    alignSelf: "center",
  };

  // When there is a footer, the footer owns the bottom inset instead of the screen.
  const safeEdges = footer ? edges.filter((edge) => edge !== "bottom") : edges;

  return (
    <SafeAreaView edges={safeEdges} style={{ flex: 1, backgroundColor }}>
      {scroll ? (
        <KeyboardAwareScrollView
          ref={scrollRef}
          bottomOffset={bottomOffset + footerHeight}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          {...scrollProps}
          style={[{ flex: 1 }, scrollProps?.style]}
          contentContainerStyle={[
            { flexGrow: 1 },
            widthStyle,
            centerContent && { justifyContent: "center" },
            contentContainerStyle,
          ]}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={[{ flex: 1 }, widthStyle, contentContainerStyle]}>
          {children}
        </View>
      )}

      {footer ? (
        <KeyboardStickyView offset={{ opened: padBottom ? insets.bottom : 0 }}>
          <View
            onLayout={(event) =>
              setFooterHeight(event.nativeEvent.layout.height)
            }
            style={{
              backgroundColor,
              paddingBottom: padBottom ? insets.bottom : 0,
            }}
          >
            {/* footerStyle padding is added on top of the safe-area inset, never replacing it */}
            <View style={footerStyle}>
              <View style={widthStyle}>{footer}</View>
            </View>
          </View>
        </KeyboardStickyView>
      ) : null}
    </SafeAreaView>
  );
}
