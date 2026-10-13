import axios from "axios";

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const getCashfreeHeaders = () => ({
  "Content-Type": "application/json",
  "x-client-id": process.env.EXPO_PUBLIC_CASHFREE_CLIENT_ID,
  "x-client-secret": process.env.EXPO_PUBLIC_CASHFREE_CLIENT_SECRET,
  "x-api-version": "2023-08-01",
});

// export const createOrder = async ({
//   orderId,
//   amount,
//   customerName,
//   customerEmail,
//   customerPhone,
// }) => {
//   console.log("reachedhiefjvor vor");
//   const { data } = await axios.post(
//     `${CASHFREE_BASE_URL}/orders`,
//     {
//       order_id: orderId,
//       order_amount: amount,
//       order_currency: "INR",
//       customer_details: {
//         customer_id: customerPhone,
//         customer_name: customerName,
//         customer_email: customerEmail,
//         customer_phone: customerPhone,
//       },
//       order_meta: {
//         return_url: `${process.env.BACKEND_URL}/payment/cashfree/return?order_id={order_id}`,
//         notify_url: `${process.env.BACKEND_URL}/payment/cashfree/webhook`,
//       },
//     },
//     {
//       headers: getCashfreeHeaders(),
//     },
//   );
//   return data;
// };
export const createOrder = async ({
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
}) => {
  const { data } = await axios.post(
    `${CASHFREE_BASE_URL}/orders`,
    {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",

      customer_details: {
        customer_id: String(customerPhone),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: String(customerPhone),
      },
    },
    {
      headers: getCashfreeHeaders(),
    },
  );

  return data;
};
export const fetchOrder = async (orderId) => {
  const { data } = await axios.get(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
    headers: getCashfreeHeaders(),
  });
  return data;
};

export const createVendor = async ({
  vendorId,
  name,
  email,
  bank,
  phoneNumber,
  panNumber,
}) => {
  console.log("Backend ENV check:");
  console.log(
    "Cashfree client ID:",
    process.env.EXPO_PUBLIC_CASHFREE_CLIENT_ID,
  );
  console.log(
    "Cashfree secret exists:",
    process.env.EXPO_PUBLIC_CASHFREE_CLIENT_SECRET,
  );

  console.log(phoneNumber);
  const { data } = await axios.post(
    `${CASHFREE_BASE_URL}/easy-split/vendors`,
    {
      vendor_id: vendorId,
      status: "ACTIVE",
      name,
      email,
      phone: phoneNumber, // Hardcoded phone
      verify_account: true,
      dashboard_access: false,
      schedule_option: 1,

      bank: {
        account_number: bank.accountNumber,
        account_holder: bank.accountHolder,
        ifsc: bank.ifsc,
      },

      kyc_details: {
        account_type: "Individual",
        business_type: "Travel and Hospitality",
        pan: panNumber,
      },
    },
    { headers: getCashfreeHeaders() },
  );

  return data;
};

export const fetchVendor = async (vendorId) => {
  const { data } = await axios.get(
    `${CASHFREE_BASE_URL}/easy-split/vendors/${vendorId}`,
    { headers: getCashfreeHeaders() },
  );
  return data;
};
