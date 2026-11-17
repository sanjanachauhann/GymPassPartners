import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

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
