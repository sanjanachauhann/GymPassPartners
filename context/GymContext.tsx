import React, { createContext, useContext, useEffect, useState } from "react";

import { getGymMembers, getMyGym } from "../backend/services/gymService";
import { useAuth } from "./AuthContext";

export interface Gym {
  _id: string;
  partnerId: string;
  gymName: string;
  address?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  rating?: number;

  passes?: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export interface GymMember {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;

  pass?: {
    _id: string;
    gymId: string;
    gymName: string;
    passType: string;
    validityDays: number;
    price: number;
    purchaseDate: string;
    expiryDate: string;
    status: string;
  };
}

interface GymContextType {
  gym: Gym | null;
  members: GymMember[];
  loadingGym: boolean;
  refreshGym: () => Promise<void>;
  refreshMembers: () => Promise<void>;
}

const GymContext = createContext<GymContextType | null>(null);

export function GymProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [gym, setGym] = useState<Gym | null>(null);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [loadingGym, setLoadingGym] = useState(true);

  // ============================================
  // LOAD GYM
  // ============================================

  const refreshGym = async () => {
    if (!user?._id) {
      setGym(null);
      setLoadingGym(false);
      return;
    }

    try {
      console.log("Loading gym for partner:", user._id);

      const data = await getMyGym(user._id);

      console.log("Gym data received:", data);

      setGym(data.gym || null);
    } catch (error) {
      console.error("Failed to load gym:", error);
      setGym(null);
    } finally {
      setLoadingGym(false);
    }
  };

  // ============================================
  // LOAD MEMBERS
  // ============================================

  const refreshMembers = async () => {
    if (!gym?._id) {
      setMembers([]);
      return;
    }

    try {
      console.log("Loading members for gym:", gym._id);

      const data = await getGymMembers(gym._id, "all");

      console.log("Members data received:", data);

      setMembers(data.members || []);
    } catch (error) {
      console.error("Failed to load gym members:", error);

      // IMPORTANT:
      // Member failure should NOT affect gym data.
      setMembers([]);
    }
  };

  // ============================================
  // LOAD GYM WHEN AUTH IS READY
  // ============================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    refreshGym();
  }, [user?._id, authLoading]);

  // ============================================
  // LOAD MEMBERS AFTER GYM IS AVAILABLE
  // ============================================

  useEffect(() => {
    if (!gym?._id) {
      return;
    }

    refreshMembers();
  }, [gym?._id]);

  return (
    <GymContext.Provider
      value={{
        gym,
        members,
        loadingGym,
        refreshGym,
        refreshMembers,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);

  if (!context) {
    throw new Error("useGym must be used inside GymProvider");
  }

  return context;
}
