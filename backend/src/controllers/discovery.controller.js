import { runDiscovery } from "../services/discovery.service.js";

export const triggerDiscovery = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

    const result = await runDiscovery(cloudAccountId);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};