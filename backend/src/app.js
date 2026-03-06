import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import cloudAccountRoutes from "./routes/cloudAccount.routes.js";
import discoveryRoutes from "./routes/discovery.routes.js";
import costRoutes from "./routes/cost.routes.js";
import idleRoutes from "./routes/idle.routes.js";
import optimizationRoutes from "./routes/optimization.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import remediationRoutes from "./routes/remediation.routes.js";
import scanRoutes from "./routes/scan.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res, next) => {
  res
    .status(200)
    .json({ success: true, message: "🚀 AutoCloud Guardian API Running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/cloud-accounts", cloudAccountRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/cost", costRoutes);
app.use("/api/idle", idleRoutes);
app.use("/api/optimization", optimizationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/remediation", remediationRoutes);
app.use("/api", scanRoutes);

export default app;
