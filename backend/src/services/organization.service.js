import Organization from "../models/organization.model.js";
import User from "../models/user.model.js";

export const createOrganization = async (userId, orgName) => {
  const existingOrg = await Organization.findOne({ name: orgName });

  if (existingOrg) {
    throw new Error("Organization already exists");
  }

  
};
