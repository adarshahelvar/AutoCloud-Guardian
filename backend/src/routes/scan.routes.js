import express from "express";
import { runFullAwsScan } from "../controllers/scan.controller.js";

const router = express.Router();

// http://localhost:5000/api/scan/aws
router.post("/scan/aws", runFullAwsScan);

export default router;