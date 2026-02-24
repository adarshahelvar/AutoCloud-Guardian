import express from "express";
import { createOrg } from "../controllers/organization.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// http://localhost:5000/api/organizations
router.post("/", protect, authorizeRoles("VIEWER", "DEVOPS_ENGINEER", "ADMIN", "SUPER_ADMIN"), createOrg);

export default router;
