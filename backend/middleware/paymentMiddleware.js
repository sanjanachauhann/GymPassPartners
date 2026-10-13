import axios from "axios";

const API_BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api`;

export const createRazorpayOrder = async (amount) => {
  const url = `${process.env.EXPO_PUBLIC_BASE_URL}/api/payment/create-order`;

  console.log("Creating Razorpay order");
  console.log("URL:", url);
  console.log("Amount:", amount);

  const response = await axios.post(url, {
    amount,
  });

  return response.data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const response = await axios.post(
    `${API_BASE_URL}/payment/verify`,
    paymentData,
  );

  return response.data;
};
export const createCashfreeOrder = async (
  registrationFee,
  ownerName,
  email,
  phone,
) => {
  const res = await fetch(`${API_BASE_URL}/payment/cashfree/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: registrationFee,
      customerName: ownerName,
      customerEmail: email,
      customerPhone: phone,
    }),
  });

  const responseText = await res.text();

  console.log("Cashfree create-order HTTP status:", res.status);

  console.log("Cashfree create-order response:", responseText);

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(`Server returned ${res.status} instead of JSON`);
  }
};
export const verifyCashfreePayment = async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/payment/cashfree/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
    }),
  });

  const responseText = await res.text();

  console.log("Cashfree verify HTTP status:", res.status);

  console.log("Cashfree verify response:", responseText);

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(`Server returned ${res.status} instead of JSON`);
  }
};
