// import express from "express";

// import {
//   getGymByPartnerId,
//   //   getGymMembers,
//   updateGymPasses,
// } from "../controllers/gymController.js";

// const router = express.Router();

// // Get the gym belonging to a partner
// router.get("/partner/:partnerId", getGymByPartnerId);

// // Get members belonging to a gym
// // router.get("/:gymId/members", getGymMembers);

// // Update gym pass prices
// router.put("/:gymId/passes", updateGymPasses);

// export default router;
import express from "express";

import {
  getGymByPartnerId,
  getGymMembers,
  updateGymPasses,
} from "../controllers/gymController.js";

const router = express.Router();

router.get("/partner/:partnerId", getGymByPartnerId);

router.get("/:gymId/members", getGymMembers);

router.put("/:gymId/passes", updateGymPasses);

export default router;
