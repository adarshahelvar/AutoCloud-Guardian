import express from "express";
import { createOrg } from "../controllers/organization.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// http://localhost:5000/api/organizations
router.post("/", protect, createOrg);

export default router;
