import express from "express";
import { triggerDiscovery } from "../controllers/discovery.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST http://localhost:PORT/api/discovery/run
router.post("/run", protect, triggerDiscovery);

export default router;
