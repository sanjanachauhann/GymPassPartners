import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { webcrypto } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import gymPartnerRequestRoutes from "./routes/gymPartnerRequest.js";
import gymRoutes from "./routes/gymRoutes.js";
import passRoutes from "./routes/pass.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

dotenv.config();

if (!globalThis.crypto?.getRandomValues) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}

const app = express();

const resolveListenHost = (value) => {
  if (!value) {
    return "0.0.0.0";
  }

  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
};

const HOST = resolveListenHost(process.env.HOST || "0.0.0.0");
const PORT = process.env.EXPO_PUBLIC_PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "GymPass Partner API is running",
  });
});

// Partner authentication
app.use("/api/auth", authRoutes);

// Gym management
app.use("/api/gym", gymRoutes);

// Pass validation
app.use("/api/pass", passRoutes);

// Partners request
app.use("/api/gymPartnerRequest", gymPartnerRequestRoutes);

// Gym routes
app.use("/api/gymRoutes", gymRoutes);

// Razorpay payments
app.use("/api/payment", paymentRoutes);

app.use("/api/vendor", vendorRoutes); //

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in backend/.env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log("Payment routes available at /api/payment");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });

// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import mongoose from "mongoose";
// import { webcrypto } from "node:crypto";
// import path from "node:path";
// import { fileURLToPath } from "node:url";
// import authRoutes from "./routes/auth.js";
// import gymPartnerRequestRoutes from "./routes/gymPartnerRequest.js";
// import gymRoutes from "./routes/gymRoutes.js";
// import passRoutes from "./routes/pass.js";
// // import razorpayPartnerRoutes from "./routes/razorpayPartner.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({
//   path: path.join(__dirname, ".env"),
// });

// if (!globalThis.crypto?.getRandomValues) {
//   Object.defineProperty(globalThis, "crypto", {
//     value: webcrypto,
//     configurable: true,
//   });
// }

// const app = express();
// const resolveListenHost = (value) => {
//   if (!value) {
//     return "0.0.0.0";
//   }

//   try {
//     return new URL(value).hostname;
//   } catch {
//     return value;
//   }
// };

// const HOST = resolveListenHost(process.env.HOST || "0.0.0.0");
// const PORT = process.env.EXPO_PUBLIC_PORT || 5001;
// const MONGO_URI = process.env.MONGO_URI;

// app.use(cors());
// app.use(express.json());

// app.get("/", (_req, res) => {
//   res.json({
//     message: "GymPass Partner API is running",
//   });
// });

// // Partner authentication
// app.use("/api/auth", authRoutes);

// // Gym management
// app.use("/api/gym", gymRoutes);

// // Pass validation
// app.use("/api/pass", passRoutes);

// //Partners request validation
// app.use("/api/gymPartnerRequest", gymPartnerRequestRoutes);

// //Gymroutes
// app.use("/api/gymRoutes", gymRoutes);

// // app.use("/api/razorpay", razorpayPartnerRoutes);

// if (!MONGO_URI) {
//   console.error("MONGO_URI is missing in backend/.env");
//   process.exit(1);
// }

// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log("MongoDB Connected");

//     app.listen(PORT, HOST, () => {
//       console.log(`Server running on http://${HOST}:${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("MongoDB connection failed", error);
//     process.exit(1);
//   });
