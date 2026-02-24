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
      required: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    region: String,
    metadata: Object,
  },
  { timestamps: true },
);

export default mongoose.model("ResourceInventory", resourceInventorySchema);
