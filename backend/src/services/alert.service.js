import nodemailer from "nodemailer";

/* Send email alert */
export const sendEmailAlert = async (email, recommendations) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_PASSWORD
    }
  });

  const message = `
AWS Cost Alert ⚠️

${recommendations.length} cost optimization issues detected.

Please login to AutoCloud Guardian dashboard to review recommendations.
`;

  await transporter.sendMail({
    from: process.env.ALERT_EMAIL,
    to: email,
    subject: "AutoCloud Guardian Alert",
    text: message
  });

};


/* Budget alert check */
export const checkBudgetAlert = async (organizationEmail, currentCost, recommendations) => {

  const budgetLimit = 50; // you can move this to DB later

  if (currentCost > budgetLimit) {

    console.log("⚠️ Budget exceeded. Sending alert email...");

    await sendEmailAlert(organizationEmail, recommendations);

    return {
      alert: true,
      message: "Budget exceeded. Alert email sent."
    };

  }

  return {
    alert: false,
    message: "Cost within budget"
  };

};