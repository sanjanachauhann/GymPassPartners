import React, { createContext, ReactNode, useContext, useState } from "react";

type Passes = {
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
};

export type GymRegistrationData = {
  // Owner Details
  ownerName: string;
  email: string;
  phone: string;
  password: string;

  // Gym Details
  // partnerId: string;
  gymName: string;
  address: string;
  placeId: string;
  rating: string;
  photos: string[];

  // Pass Prices
  passes: Passes;
};

const initialData: GymRegistrationData = {
  ownerName: "",
  email: "",
  phone: "",
  password: "",

  // partnerId: "",
  gymName: "",
  address: "",
  placeId: "",
  rating: "",
  photos: [],

  passes: {
    daily: "",
    weekly: "",
    monthly: "",
    yearly: "",
  },
};

type GymRegistrationContextType = {
  registration: GymRegistrationData;

  setRegistration: React.Dispatch<React.SetStateAction<GymRegistrationData>>;

  resetRegistration: () => void;
};

const GymRegistrationContext = createContext<GymRegistrationContextType | null>(
  null,
);

export const GymRegistrationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [registration, setRegistration] =
    useState<GymRegistrationData>(initialData);

  const resetRegistration = () => {
    setRegistration(initialData);
  };

  return (
    <GymRegistrationContext.Provider
      value={{
        registration,
        setRegistration,
        resetRegistration,
      }}
    >
      {children}
    </GymRegistrationContext.Provider>
  );
};

export const useGymRegistration = () => {
  const context = useContext(GymRegistrationContext);

  if (!context) {
    throw new Error(
      "useGymRegistration must be used inside GymRegistrationProvider",
    );
  }

  return context;
};
