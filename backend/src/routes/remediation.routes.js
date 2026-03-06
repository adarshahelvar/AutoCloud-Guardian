import express from "express";
import { triggerRemediation } from "../controllers/remediation.controller.js";

const router = express.Router();

// http://localhost:5000/api/remediation/run
router.post("/run", triggerRemediation);

export default router;