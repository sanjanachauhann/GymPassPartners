import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../services/apiConfig";

// process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.0.221:5001/api";
// ("http://192.168.0.245:5001/api");

const BASE_URL = `${API_BASE_URL}/pass`;

export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// CREATE PASS AFTER SUCCESSFUL PAYMENT

export const createPass = async ({ gymId, gymName, passType, price }) => {
  const headers = await getAuthHeaders();
  if (!headers) {
    throw new Error("Please log in before creating a pass.");
  }
  console.log("Creating pass...");

  const response = await axios.post(
    `${BASE_URL}/buy`,
    {
      // gymId,
      gymName,
      passType,
      price,
    },
    {
      headers,
    },
  );

  return response.data;
};

// GET ACTIVE PASSES
export const getActivePasses = async () => {
  const headers = await getAuthHeaders();

  if (!headers) {
    return [];
  }

  const response = await axios.get(`${BASE_URL}/active`, {
    headers,
  });

  return response.data;
};

// GET ACTIVE AND EXPIRED PASSES
export const getPasses = async () => {
  const headers = await getAuthHeaders();

  if (!headers) {
    return [];
  }

  const response = await axios.get(BASE_URL, {
    headers,
  });

  return response.data;
};

// export const scanPass = async (memberId, gymId) => {
//   const response = await axios.post(`${BASE_URL}/scan`, {
//     memberId,
//     gymId,
//   });

//   return response.data;
// };
