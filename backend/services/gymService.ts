import axios from "axios";

const API_BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api`;
const BASE_URL = `${API_BASE_URL}/gym`;

export const getMyGym = async (partnerId: string) => {
  const url = `${BASE_URL}/partner/${partnerId}`;

  console.log("=================================");
  console.log("GET MY GYM");
  console.log("URL:", url);
  console.log("PARTNER ID:", partnerId);
  console.log("=================================");

  try {
    const response = await axios.get(url);

    console.log("GYM RESPONSE:", response.data);

    return response.data;
  } catch (error: any) {
    console.log("=================================");
    console.log("GET MY GYM ERROR");
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("URL:", error.config?.url);
    console.log("=================================");

    throw error;
  }
};

// export const getGymMembers = async (gymId: string) => {
//   const url = `${BASE_URL}/${gymId}/members`;

//   console.log("GET GYM MEMBERS URL:", url);

//   const response = await axios.get(url);

//   return response.data;
// };

export const updateGymPasses = async (gymId: string, passes: any) => {
  const url = `${BASE_URL}/${gymId}/passes`;

  console.log("UPDATE GYM PASSES URL:", url);
  console.log("GYM ID:", gymId);
  console.log("NEW PASSES:", passes);

  const response = await axios.put(url, {
    passes,
  });

  console.log("UPDATE RESPONSE:", response.data);

  return response.data;
};

export const getGymMembers = async (gymId: string, filter: string = "all") => {
  const url = `${BASE_URL}/${gymId}/members`;

  console.log("=================================");
  console.log("GET GYM MEMBERS");
  console.log("URL:", url);
  console.log("GYM ID:", gymId);
  console.log("FILTER:", filter);
  console.log("=================================");

  const response = await axios.get(url, {
    params: {
      filter,
    },
  });

  console.log("MEMBERS RESPONSE:", response.data);

  return response.data;
};
