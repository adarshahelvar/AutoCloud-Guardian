import express from "express";
import { getCostAnalysis } from "../controllers/cost.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { getCostTrendAnalysis } from "../controllers/costTrend.controller.js";

const router = express.Router();

// http://localhost:5000/api/cost
router.post("/", protect, getCostAnalysis);
// http://localhost:5000/api/cost/trend
router.post("/trend", getCostTrendAnalysis);

export default router;