import express from "express";
import { getCostAnalysis } from "../controllers/cost.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// http://locathost:5000/api/cost
router.post("/", protect, getCostAnalysis);

export default router;