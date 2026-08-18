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

// HTTP API provider (e.g. Resend) — works where SMTP ports are blocked (Render free tier)
const sendViaResend = async ({ to, subject, html }) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "MentriQ Forge <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API error ${res.status}: ${errText}`);
  }
  return res.json();
};

const buildActionEmailHtml = ({ heading, message, buttonText, link, expiryNote }) => {
  const escaped = (s = "") =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return `
    <div style="max-width:560px;margin:0 auto;font-family:Segoe UI,system-ui,-apple-system,sans-serif;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#6C63FF,#4f46e5);padding:28px 32px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.3px;">MentriQ Forge</span>
        </div>
        <div style="font-size:13px;color:#c7d2fe;margin-top:2px;">Project-based hiring platform</div>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1e293b;font-size:20px;margin:0 0 12px;">${escaped(heading)}</h2>
        <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">${escaped(message)}</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${escaped(link)}" style="display:inline-block;padding:14px 32px;background:#6C63FF;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">${escaped(buttonText)}</a>
        </div>
        ${expiryNote ? `<p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0 0 20px;">${escaped(expiryNote)}</p>` : ""}
        <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">If the button doesn't work, copy and paste this link into your browser:<br /><a href="${escaped(link)}" style="color:#6C63FF;">${escaped(link)}</a></p>
      </div>
      <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">This is an automated message from MentriQ Forge. If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;
};

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend({ to, subject, html });
  }

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

module.exports = { sendEmail, buildActionEmailHtml };