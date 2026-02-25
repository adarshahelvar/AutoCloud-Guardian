import express from "express";
import { getRecommendations } from "../controllers/recommendation.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// http://localhost:5000/api/recommendations?cloudAccountId=YOUR_OBJECT_ID
router.get("/", protect, getRecommendations);

export default router;