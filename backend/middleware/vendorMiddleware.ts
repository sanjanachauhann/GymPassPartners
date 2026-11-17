import { API_BASE_URL } from "../services/apiConfig";
export const setupPayoutAccount = async (
  gymId: string,
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    panNumber: string;
    name: string;
    email: string;
    phoneNumber: string;
  },
) => {
  const res = await fetch(`${API_BASE_URL}/vendor/${gymId}/payout-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bankDetails),
  });
  return res.json();
};
