const expoConfig = require("./app.json");

module.exports = ({ config = {} }) => {
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY;

  return {
    ...expoConfig.expo,
    ...config,
    android: {
      ...expoConfig.expo.android,
      ...config.android,
      config: {
        ...expoConfig.expo.android.config,
        ...config.android?.config,
        googleMaps: {
          ...expoConfig.expo.android.config?.googleMaps,
          ...config.android?.config?.googleMaps,
          ...(googleMapsApiKey ? { apiKey: googleMapsApiKey } : {}),
        },
      },
    },
    extra: {
      ...expoConfig.expo.extra,
      ...config.extra,
      googleMapsApiKey: googleMapsApiKey,
    },
  };
};
