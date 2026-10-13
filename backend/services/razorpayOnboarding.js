const RAZORPAY_AUTH_URL = "https://auth.razorpay.com";
const RAZORPAY_API_URL = "https://api.razorpay.com";

/*
|--------------------------------------------------------------------------
| Get Razorpay Partner Access Token
|--------------------------------------------------------------------------
*/

// export const getPartnerAccessToken = async () => {
//   try {
//     const response = await axios.post(
//       `${RAZORPAY_AUTH_URL}/token`,
//       new URLSearchParams({
//         client_id: process.env.RAZORPAY_CLIENT_ID,
//         client_secret: process.env.RAZORPAY_CLIENT_SECRET,
//         grant_type: "client_credentials",
//         mode: process.env.RAZORPAY_MODE || "test",
//       }).toString(),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       },
//     );

//     return response.data.access_token;
//   } catch (error) {
//     console.error(
//       "Razorpay partner token error:",
//       error.response?.data || error.message,
//     );

//     throw error;
//   }
// };

/*
|--------------------------------------------------------------------------
| Create Razorpay Linked Account
|--------------------------------------------------------------------------
*/

// export const createRazorpayAccount = async ({
//   email,
//   phone,
//   businessName,
//   referenceId,
//   partnerId,
// }) => {
//   try {
//     const accessToken = await getPartnerAccessToken();

//     const response = await axios.post(
//       `${RAZORPAY_API_URL}/v2/accounts`,
//       {
//         email,
//         phone: String(phone),

//         legal_business_name: businessName,

//         customer_facing_business_name: businessName,

//         business_type: "individual",

//         reference_id: referenceId,

//         profile: {
//           category: "health",
//           subcategory: "fitness",
//         },

//         contact_info: {
//           contact_name: businessName,
//           email,
//           phone: String(phone),
//         },

//         notes: {
//           gymId: referenceId,
//           partnerId: String(partnerId),
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Create Razorpay account error:",
//       error.response?.data || error.message,
//     );

//     throw error;
//   }
// };

/*
|--------------------------------------------------------------------------
| Generate Razorpay Onboarding URL
|--------------------------------------------------------------------------
*/

// export const generateOnboardingUrl = ({ accountId }) => {
//   const timestamp = Math.floor(Date.now() / 1000);

//   const subMerchantId = accountId.replace(/^acc_/, "");

//   const onboardingSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_CLIENT_SECRET)
//     .update(`${subMerchantId}|${timestamp}`)
//     .digest("hex");

//   const state = crypto.randomBytes(24).toString("hex");

//   const params = new URLSearchParams({
//     client_id: process.env.RAZORPAY_CLIENT_ID,

//     response_type: "code",

//     redirect_uri: process.env.RAZORPAY_REDIRECT_URI,

//     scope: "read_write",

//     state,

//     onboarding_signature: onboardingSignature,
//   });

//   return `${RAZORPAY_AUTH_URL}/authorize?${params.toString()}`;
// };

/*
|--------------------------------------------------------------------------
| Exchange Authorization Code
|--------------------------------------------------------------------------
*/

// export const exchangeAuthorizationCode = async (code) => {
//   try {
//     const response = await axios.post(
//       `${RAZORPAY_AUTH_URL}/token`,
//       {
//         client_id: process.env.RAZORPAY_CLIENT_ID,

//         client_secret: process.env.RAZORPAY_CLIENT_SECRET,

//         grant_type: "authorization_code",

//         redirect_uri: process.env.RAZORPAY_REDIRECT_URI,

//         code,

//         mode: process.env.RAZORPAY_MODE || "test",
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Razorpay authorization exchange error:",
//       error.response?.data || error.message,
//     );

//     throw error;
//   }
// };
