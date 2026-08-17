const nodemailer = require("nodemailer");
const dns = require("dns").promises;
const net = require("net");

const isIp = (host) => net.isIP(host) !== 0;

const resolveIPv4 = async (host) => {
  if (!host || isIp(host)) return host;
  try {
    const addresses = await dns.resolve4(host);
    return addresses[0] || host;
  } catch {
    return host;
  }
};

const createTransporter = async () => {
  const host = process.env.SMTP_HOST || "smtp.ethereal.email";
  const ipv4Host = await resolveIPv4(host);
  return nodemailer.createTransport({
    host: ipv4Host,
    servername: ipv4Host === host ? undefined : host,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 20000,
  });
};

const transporterPromise = createTransporter();

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

  const transporter = await transporterPromise;
  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendEmail };