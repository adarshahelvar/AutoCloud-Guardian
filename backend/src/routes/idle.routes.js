import express from "express";
import { runIdleCheck } from "../controllers/idle.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// http://localhost:5000/api/idle
router.post("/", protect, runIdleCheck);

export default router;