import express from "express";
import { addCloudAccount } from "../controllers/cloudAccount.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { requireOrganization } from "../middleware/tenant.middleware.js";

const router = express.Router();

//  http://localhost:5000/api/cloud-accounts
router.post(
  "/",
  protect,
  requireOrganization,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  addCloudAccount,
);

export default router;
