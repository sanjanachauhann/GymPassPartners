import express from "express";

import Gym from "../models/Gym.js";

const router = express.Router();

// REGISTER GYM
router.post("/register", async (req, res) => {
  try {
    const { partnerId, placeId, gymName, address, rating, passes } = req.body;

    // CHECK IF GYM ALREADY EXISTS
    const existingGym = await Gym.findOne({ placeId });

    if (existingGym) {
      return res.status(400).json({
        message: "Gym is already registered",
      });
    }

    // CREATE GYM
    const gym = await Gym.create({
      partnerId,
      placeId,
      gymName,
      address,
      rating,
      passes,
    });

    res.status(201).json({
      success: true,
      gym,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const toNumber = (value) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const getDistanceKm = (
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude,
) => {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((toLatitude - fromLatitude) * Math.PI) / 180;
  const longitudeDelta = ((toLongitude - fromLongitude) * Math.PI) / 180;
  const startLatitude = (fromLatitude * Math.PI) / 180;
  const endLatitude = (toLatitude * Math.PI) / 180;

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const getGoogleNearbyGyms = async ({ latitude, longitude, radius }) => {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY is missing");
  }

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: String(Math.round(radius * 1000)),
    type: "gym",
    keyword: "gym",
    key: GOOGLE_PLACES_API_KEY,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`,
  );
  const data = await response.json();

  if (!response.ok || data.status === "REQUEST_DENIED") {
    throw new Error(data.error_message || "Google Places request failed");
  }

  return Array.isArray(data.results) ? data.results : [];
};

router.get("/nearby", async (req, res) => {
  try {
    const latitude = toNumber(req.query.latitude);
    const longitude = toNumber(req.query.longitude);
    const radius = toNumber(req.query.radius) || 5;

    if (latitude === null || longitude === null) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const googleGyms = await getGoogleNearbyGyms({
      latitude,
      longitude,
      radius,
    });
    const googlePlaceIds = googleGyms
      .map((gym) => gym.place_id)
      .filter((placeId) => typeof placeId === "string" && placeId.trim());

    const gyms = await Gym.find({
      googlePlaceId: { $in: googlePlaceIds },
      dailyPrice: { $type: "number", $gt: 0 },
    }).lean();

    const gymsByGooglePlaceId = new Map(
      gyms.map((gym) => [gym.googlePlaceId, gym]),
    );

    const nearbyGyms = googleGyms
      .map((googleGym) => {
        const gym = gymsByGooglePlaceId.get(googleGym.place_id);

        if (!gym) {
          return null;
        }

        const googleLatitude = googleGym.geometry?.location?.lat;
        const googleLongitude = googleGym.geometry?.location?.lng;
        const gymLatitude =
          typeof googleLatitude === "number" ? googleLatitude : gym.latitude;
        const gymLongitude =
          typeof googleLongitude === "number" ? googleLongitude : gym.longitude;

        return {
          ...gym,
          id: gym._id,
          googlePlaceId: googleGym.place_id,
          gymName: gym.gymName || googleGym.name,
          address: googleGym.vicinity || gym.address,
          latitude: gymLatitude,
          longitude: gymLongitude,
          rating:
            typeof googleGym.rating === "number"
              ? googleGym.rating
              : gym.rating,
          isOpen: googleGym.opening_hours?.open_now,
          distanceKm:
            typeof gymLatitude === "number" && typeof gymLongitude === "number"
              ? getDistanceKm(latitude, longitude, gymLatitude, gymLongitude)
              : null,
        };
      })
      .filter(Boolean)
      .filter((gym) => gym.distanceKm === null || gym.distanceKm <= radius)
      .sort((firstGym, secondGym) => {
        if (firstGym.distanceKm === null) {
          return 1;
        }

        if (secondGym.distanceKm === null) {
          return -1;
        }

        return firstGym.distanceKm - secondGym.distanceKm;
      });

    res.json(nearbyGyms);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
