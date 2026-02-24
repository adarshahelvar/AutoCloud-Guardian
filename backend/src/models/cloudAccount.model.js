import mongoose from "mongoose";

const cloudAccountSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    awsAccountId: {
      type: String,
      required: true,
    },
    roleArn: {
      type: String,
      required: true,
    },
    externalId: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "FAILED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.model("CloudAccount", cloudAccountSchema);