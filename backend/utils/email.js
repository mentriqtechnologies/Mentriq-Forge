const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"MentriQ Forge" <${process.env.SMTP_FROM || "noreply@mentriqforge.com"}>`,
    to,
    subject,
    html,
  };

  if (process.env.NODE_ENV !== "production" && !process.env.SMTP_USER) {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    const info = await testTransporter.sendMail(mailOptions);
    console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
    return;
  }

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendEmail };
