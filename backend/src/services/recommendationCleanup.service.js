// This is for deleting duplicate recommendations

import Recommendation from "../models/recommendation.model.js";

export const cleanupDuplicateRecommendations = async (cloudAccountId) => {
  const duplicates = await Recommendation.aggregate([
    {
      $match: {
        cloudAccount: Recommendation.db.base.Types.ObjectId.createFromHexString(
          cloudAccountId
        ),
        status: "OPEN",
      },
    },
    {
      $group: {
        _id: {
          organization: "$organization",
          cloudAccount: "$cloudAccount",
          resourceId: "$resourceId",
          resourceType: "$resourceType",
          status: "$status",
        },
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);

  let deletedCount = 0;

  for (const group of duplicates) {
    const idsToDelete = group.ids.slice(1);

    if (idsToDelete.length > 0) {
      const result = await Recommendation.deleteMany({
        _id: { $in: idsToDelete },
      });
      deletedCount += result.deletedCount;
    }
  }

  return {
    deletedCount,
    duplicateGroups: duplicates.length,
  };
};