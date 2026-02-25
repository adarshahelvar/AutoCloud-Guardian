import express from "express";
import { triggerOptimization } from "../controllers/optimization.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// http://localhost:5000/api/optimization/run
router.post("/run", protect, triggerOptimization);

export default router;
