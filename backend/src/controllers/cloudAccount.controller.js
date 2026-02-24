import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export const addCloudAccount = async (req, res) => {
  console.log(req.body);
  try {
    const { awsAccountId, roleArn, externalId, region } = req.body;

    // 1️⃣ Assume Role
    const tempCredentials = await assumeCustomerRole(
      roleArn,
      externalId,
      region,
    );

    // 2️⃣ Verify Access (Example: Call EC2 API)
    const ec2Client = new EC2Client({
      region,
      credentials: tempCredentials,
    });

    await ec2Client.send(new DescribeInstancesCommand({}));

    // 3️⃣ Save in DB
    const cloudAccount = await CloudAccount.create({
      organization: req.user.organizationId,
      awsAccountId,
      roleArn,
      externalId,
      region,
      status: "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Cloud account connected successfully",
      data: cloudAccount,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: "Failed to connect AWS account",
      error: error.message,
    });
  }
};
