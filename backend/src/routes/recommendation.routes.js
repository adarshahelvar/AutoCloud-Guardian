import express from "express";
import { cleanupRecommendations, getRecommendations } from "../controllers/recommendation.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// http://localhost:5000/api/recommendations?cloudAccountId=YOUR_OBJECT_ID
router.get("/", protect, getRecommendations);

// http://localhost:5000/api/recommendations/cleanup
router.post("/cleanup", protect, cleanupRecommendations);
export default router;