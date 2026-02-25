import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    cloudAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudAccount",
      required: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
    },
    message: String,
    estimatedMonthlySavings: Number,
    status: {
      type: String,
      enum: ["OPEN", "DISMISSED", "RESOLVED"],
      default: "OPEN",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Recommendation", recommendationSchema);
