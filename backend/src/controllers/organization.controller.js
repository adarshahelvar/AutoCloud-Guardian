import { createOrganization } from "../services/organization.service.js";

export const createOrg = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Organization name requried...!" });
    }

    const organization = await createOrganization(req.user._id, name);

    res.status(201).json({
      success: true,
      message: "Organization created successfully...!",
      organization,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
