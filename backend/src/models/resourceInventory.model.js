import mongoose from "mongoose";

const resourceInventorySchema = new mongoose.Schema(
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
    resourceType: {
      type: String,
      enum: ["EC2", "RDS", "S3"],
      required: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
    },
    lastScannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// That unique index prevents duplicates during re-scan.
resourceInventorySchema.index(
  { resourceId: 1, cloudAccount: 1 },
  { unique: true }
);

export default mongoose.model(
  "ResourceInventory",
  resourceInventorySchema
);