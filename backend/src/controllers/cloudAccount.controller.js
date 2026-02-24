import mongoose from "mongoose";
const cloudAccountSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    accountName: {
      type: String,
      requried: true,
    },
    awsAccoutId: {
      type: String,
      requried: true,
    },
    roleArn: {
      type: String,
      requried: true,
    },
    externalId: {
      type: String,
      requried: true,
    },
    region: {
      type: String,
      requried: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INVALID"],
      default: "ACTIVE",
    },
  },
  { timeStamps: true },
);

export default mongoose.model("CloudAccount", cloudAccountSchema);
