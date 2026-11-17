const configuredBaseUrl =
  process.env.EXPO_PUBLIC_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://gympasspartners.onrender.com";

const configuredPort = process.env.EXPO_PUBLIC_PORT || "5001";
const cleanBaseUrl = configuredBaseUrl.trim().replace(/\/+$/, "");
const parsedBaseUrl = new URL(
  /^https?:\/\//i.test(cleanBaseUrl)
    ? cleanBaseUrl
    : `http://${cleanBaseUrl}`,
);

// Use the local backend port for plain HTTP development hosts. Render and
// other HTTPS hosts should use their normal TLS endpoint without :5001.
if (
  parsedBaseUrl.protocol === "http:" &&
  !parsedBaseUrl.port &&
  !parsedBaseUrl.pathname.endsWith("/api")
) {
  parsedBaseUrl.port = configuredPort;
}

const normalizedBaseUrl = parsedBaseUrl.toString().replace(/\/+$/, "");

export const API_BASE_URL = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;
