import { create } from 'zustand';

type LocationStore = {
  currentLocation: string;

  latitude: number;
  longitude: number;

  setLocation: (
    location: string,
    lat: number,
    lng: number
  ) => void;
};

export const useLocationStore =
  create<LocationStore>((set) => ({

    currentLocation: 'Fetching location...',

    latitude: 0,
    longitude: 0,

    setLocation: (
      location,
      lat,
      lng
    ) =>
      set({
        currentLocation: location,
        latitude: lat,
        longitude: lng,
      }),

  }));