const COLOR_HEX: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
  gray: "#9ca3af",
  grey: "#9ca3af",
  olive: "#74784f",
  navy: "#1e3a5f",
  brown: "#795548",
  beige: "#d8c3a5",
  red: "#b54b4b",
};

export function getColorHex(name: string, fallback: string) {
  return COLOR_HEX[name.trim().toLowerCase()] ?? fallback;
}
