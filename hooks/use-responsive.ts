import { useMemo } from "react";
import { PixelRatio, useWindowDimensions } from "react-native";

/** Width of the phone the screens were originally designed on (iPhone 14/15). */
const BASE_WIDTH = 390;

/** Content never stretches wider than this (keeps forms readable on tablets / foldables). */
export const MAX_CONTENT_WIDTH = 560;

/** Caps how much the OS "large text" setting can grow text inside fixed-size UI. */
export const MAX_FONT_MULTIPLIER = 1.3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Screen-size helpers that update live on rotation, split-screen,
 * foldables and iPad multitasking (unlike `Dimensions.get` at module scope).
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const shortSide = Math.min(width, height);
    const isTablet = shortSide >= 600;
    const isSmallPhone = width < 360 || height < 680;
    const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
    const ratio = clamp(contentWidth / BASE_WIDTH, 0.82, 1.2);

    /** Scale a size linearly with the screen width (for boxes, icons, artwork). */
    const scale = (size: number) =>
      PixelRatio.roundToNearestPixel(size * ratio);

    /** Scale a size only part of the way (for font sizes and spacing). */
    const moderateScale = (size: number, factor = 0.5) =>
      PixelRatio.roundToNearestPixel(size + (size * ratio - size) * factor);

    return {
      width,
      height,
      contentWidth,
      isTablet,
      isSmallPhone,
      scale,
      moderateScale,
      fontSize: moderateScale,
      /** Horizontal page padding. */
      gutter: isSmallPhone ? 16 : 20,
    };
  }, [width, height]);
}
