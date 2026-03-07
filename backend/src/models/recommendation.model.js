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
    region: {
      type: String,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
    },
    category: {
      type: String,
      enum: ["ACTIONABLE", "ADVISORY"],
      default: "ADVISORY",
    },
    action: {
      type: String,
      enum: [
        "STOP",
        "TERMINATE",
        "DELETE",
        "RELEASE",
        "REVIEW",
        "OPTIMIZE",
        "NONE",
      ],
      default: "NONE",
    },
    message: String,
    remediation: String,
    estimatedMonthlySavings: Number,
    status: {
      type: String,
      enum: ["OPEN", "DISMISSED", "RESOLVED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Recommendation", recommendationSchema);