// import axios from "axios";

// const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// export const connectRazorpayApi = async (
//   gymId: string,
//   email: string,
//   phone: string,
// ) => {
//   console.log(" getting here", gymId);
//   const response = await axios.post(`${API_BASE_URL}/api/payment/connect`, {
//     gymId,
//     email,
//     phone,
//   });

//   return response.data;
// };

// export const setupCashfreeVendorApi = async (
//   gymId: string,
//   bankDetails: {
//     accountHolder: string;
//     accountNumber: string;
//     ifsc: string;
//     panNumber: string;
//     name?: string;
//     email?: string;
//     phone?: string;
//   },
// ) => {
//   const res = await fetch(
//     `${API_BASE_URL}/api/vendor/${gymId}/payout-account`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(bankDetails),
//     },
//   );
//   return res.json();
// };

// export const getCashfreeVendorStatusApi = async (gymId: string) => {
//   const res = await fetch(`${API_BASE_URL}/api/vendor/${gymId}/payout-account`);
//   return res.json();
// };
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const connectRazorpayApi = async (
  gymId: string,
  email: string,
  phone: string,
) => {
  console.log(" getting here", gymId);
  const response = await axios.post(`${API_BASE_URL}/api/payment/connect`, {
    gymId,
    email,
    phone,
  });

  return response.data;
};

export const setupCashfreeVendorApi = async (
  gymId: string,
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    panNumber: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
  },
) => {
  const token = await AsyncStorage.getItem("token");

  const response = await axios.post(
    `${API_BASE_URL}/api/vendor/${gymId}/payout-account`,
    bankDetails,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getCashfreeVendorStatusApi = async (gymId: string) => {
  const token = await AsyncStorage.getItem("token");

  const response = await axios.get(
    `${API_BASE_URL}/api/vendor/${gymId}/payout-account`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
