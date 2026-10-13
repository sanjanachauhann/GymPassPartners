import axios from "axios";
import { getAuthHeaders } from "./passMiddleware";

// const API_BASE_URL = "http://192.168.0.245:5001/api";
const API_BASE_URL = `${process.env.EXPO_BASE_URL}:${process.env.PORT}/api`;

const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

export const updateProfile = async ({ name, email, phone, photo }) => {
  const headers = await getAuthHeaders();

  const response = await axios.put(
    `${AUTH_BASE_URL}/profile`,
    {
      name,
      email,
      phone,
      photo,
    },
    {
      headers,
    },
  );

  return response.data;
};

export const deleteAccount = async () => {
  const headers = await getAuthHeaders();

  const response = await axios.delete(`${AUTH_BASE_URL}/delete`, {
    headers,
  });

  return response.data;
};
