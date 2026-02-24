import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import cloudAccountRoutes from "./routes/cloudAccount.routes.js";
import discoveryRoutes from "./routes/discovery.routes.js";

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

export default app;
