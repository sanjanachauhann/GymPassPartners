import axios from "axios";
import { getAuthHeaders } from "./passMiddleware.js";

const getApiBaseUrl = () => {
  const fullBaseUrl = process.env.EXPO_PUBLIC_BASE_URL;
  const port = process.env.EXPO_PUBLIC_PORT || process.env.PORT || "5001";

  if (fullBaseUrl) {
    const cleanBaseUrl = fullBaseUrl.replace(/\/$/, "");
    const hasProtocol = /^https?:\/\//i.test(cleanBaseUrl);
    const baseUrl = hasProtocol ? cleanBaseUrl : `http://${cleanBaseUrl}`;
    const parsedUrl = new URL(baseUrl);

    if (!parsedUrl.port && !cleanBaseUrl.endsWith("/api")) {
      parsedUrl.port = port;
    }

    const normalizedUrl = parsedUrl.toString().replace(/\/$/, "");

    return normalizedUrl.endsWith("/api") ? normalizedUrl : `${normalizedUrl}/api`;
  }

  const host = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (host) {
    const cleanHost = host.replace(/\/$/, "");
    const hasProtocol = /^https?:\/\//i.test(cleanHost);
    const baseUrl = hasProtocol ? cleanHost : `http://${cleanHost}`;
    const parsedUrl = new URL(baseUrl);

    if (!parsedUrl.port) {
      parsedUrl.port = port;
    }

    const normalizedUrl = parsedUrl.toString().replace(/\/$/, "");

    return normalizedUrl.endsWith("/api") ? normalizedUrl : `${normalizedUrl}/api`;
  }

  throw new Error("API base URL is not configured.");
};

const API_BASE_URL = getApiBaseUrl();
const BASE_URL = `${API_BASE_URL}/pass`;

export const validatePass = async (passId) => {
  const headers = await getAuthHeaders();

  if (!headers) {
    throw new Error("Please log in before validating passes.");
  }

  const url = `${BASE_URL}/scan`;
  console.log("Validating pass at:", url);

  const response = await axios.post(
    url,
    {
      passId,
    },
    {
      headers,
    },
  );

  return response.data;
};
