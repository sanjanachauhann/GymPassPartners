import axios from "axios";
import { API_BASE_URL } from "../services/apiConfig";

const BASE_URL = `${API_BASE_URL}/gymPartnerRequest`;

export const createGymPartnerReq = async (registration) => {
  console.log("URL:", `${BASE_URL}/signup`);
  console.log("BODY:", registration);
  const response = await axios.post(`${BASE_URL}/signup`, registration);
  return response.data;
};

export const getGymRequest = async (requestId) => {
  const response = await axios.get(`${BASE_URL}/${requestId}`);

  return response.data;
};

export const setupPassword = async (token, password) => {
  const { data } = await axios.post(`${BASE_URL}/setup-password`, {
    token,
    password,
  });

  return data;
};
