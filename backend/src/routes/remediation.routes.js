import express from "express";
import { fixOneRecommendation, triggerRemediation } from "../controllers/remediation.controller.js";

const router = express.Router();

// http://localhost:5000/api/remediation/run
router.post("/run", triggerRemediation);

// http://localhost:5000/api/remediation/fix-one
router.post("/fix-one", fixOneRecommendation);

export default router;