import axios from "axios";
import { getAuthHeaders } from "./passMiddleware.js";
import { API_BASE_URL } from "../services/apiConfig";
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
