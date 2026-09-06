import {MD3DarkTheme, MD3LightTheme} from "react-native-paper";

export const palette = {
  indigo50: "#F1EFFF",
  indigo100: "#E7E4FF",
  indigo200: "#C9C2FF",
  indigo400: "#8579F5",
  indigo500: "#6B5DEF",
  indigo600: "#5B4FE9",
  indigo700: "#4A3ED4",
  indigo900: "#1B1250",
  mint500: "#00A896",
  mint600: "#008F7F",
  coral500: "#FF6B6B",
  amber500: "#F59E0B",
  slate50: "#F7F7FB",
  slate100: "#EEEDF5",
  slate200: "#DFDCEA",
  slate400: "#9995AA",
  slate500: "#605E70",
  slate700: "#3B3A47",
  slate900: "#1C1B23",
  ink: "#0F0E17",
  white: "#FFFFFF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const shadow = {
  sm: {
    shadowColor: "#0F0E17",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#0F0E17",
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  brand: {
    shadowColor: palette.indigo600,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const typography = {
  headingFamily: "Lato_700Bold",
  bodyFamily: "Roboto_500Medium",
};

export const lightTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.indigo600,
    onPrimary: palette.white,
    primaryContainer: palette.indigo100,
    onPrimaryContainer: palette.indigo900,
    secondary: palette.mint500,
    onSecondary: palette.white,
    secondaryContainer: "#D6F4EE",
    onSecondaryContainer: "#003D34",
    tertiary: palette.amber500,
    onTertiary: palette.white,
    background: palette.slate50,
    onBackground: palette.slate900,
    surface: palette.white,
    onSurface: palette.slate900,
    surfaceVariant: palette.slate100,
    onSurfaceVariant: palette.slate500,
    outline: palette.slate200,
    outlineVariant: "#EBE9F3",
    error: "#DC2626",
    onError: palette.white,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: palette.white,
      level2: palette.white,
      level3: palette.white,
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#B7ADFF",
    onPrimary: "#1B1250",
    primaryContainer: "#3C2FC2",
    onPrimaryContainer: palette.indigo100,
    secondary: "#5FE4CC",
    onSecondary: "#00382E",
    tertiary: "#FFB86B",
    background: palette.ink,
    onBackground: "#E6E4F2",
    surface: "#1A1927",
    onSurface: "#E6E4F2",
    surfaceVariant: "#26243A",
    onSurfaceVariant: "#B0AEC0",
    outline: "#3A3852",
    error: "#FF8080",
  },
};

export const timerColors = [palette.mint500, palette.mint500, palette.amber500, palette.coral500];
export const timerColorsTime = [30, 15, 8, 0];
