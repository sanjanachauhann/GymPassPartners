import axios from "axios";

const API_BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api`;
// process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.0.221:5001/api";
// "http://192.168.0.245:5001/api";

// const API_BASE_URL = "http://0.0.0.0:5001/api";
const BASE_URL = `${API_BASE_URL}/auth`;

// LOGIN
export const loginUser = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/login`, {
    email,
    password,
  });

  return response.data;
};

// SIGNUP
export const signupUser = async (name, email, phone, password) => {
  console.log("Base url is as followB", BASE_URL);
  const response = await axios.post(`${BASE_URL}/signup`, {
    name,
    email,
    phone,
    password,
  });
  return response.data;
};
export const setupPassword = async (email, password) => {
  console.log(email);
  const response = await axios.post(`${BASE_URL}/setup-password`, {
    email,
    password,
  });

  return response.data;
};
