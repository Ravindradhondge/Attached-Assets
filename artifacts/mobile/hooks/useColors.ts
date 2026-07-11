import colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Returns design tokens for the user's chosen theme (light or dark).
 * Preference is persisted to AsyncStorage via ThemeContext.
 */
export function useColors() {
  const { theme } = useTheme();
  const palette = theme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
