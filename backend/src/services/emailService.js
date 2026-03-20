require('dotenv').config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  console.log(to)
  try {
    const response = await resend.emails.send({
      from: "INTRA AI <noreply@update.makulsaini.online>",
      to,
      subject,
      html,
    });

    console.log("Mail sent:", response);
    return response;
  } catch (err) {
    console.error("Mail error:", err);
    throw err;
  }
};

const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>INTRA AI</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f1f5f9; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
    .body { padding: 32px; }
    .body h2 { color: #1e293b; }
    .body p { color: #475569; line-height: 1.6; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563EB, #7C3AED); color: white;
           padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;
           font-size: 16px; margin: 16px 0; }
    .footer { padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
    .otp-box { background: #f8fafc; border: 2px dashed #2563EB; border-radius: 12px; padding: 20px;
                text-align: center; margin: 20px 0; }
    .otp-code { font-size: 40px; font-weight: 800; color: #2563EB; letter-spacing: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>🤖 INTRA AI</h1>
        <p>The Future of Conversational AI</p>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} INTRA AI. All rights reserved.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

const verificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  const content = `
    <h2>Welcome, ${name}! 🎉</h2>
    <p>Thanks for signing up for INTRA AI. Please verify your email address to get started.</p>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    </div>
    <p style="color: #94a3b8; font-size: 13px;">This link expires in 24 hours. If you didn't register, ignore this email.</p>
    <p style="color: #94a3b8; font-size: 13px;">Or copy this link: ${verifyUrl}</p>
  `;
  await sendEmail({
    to: email,
    subject: 'Verify your INTRA AI account',
    html: emailTemplate(content),
  });
};

const passwordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hi ${name}, we received a request to reset your password.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="color: #94a3b8; font-size: 13px;">This link expires in 1 hour.</p>
  `;
  await sendEmail({
    to: email,
    subject: 'Reset your INTRA AI password',
    html: emailTemplate(content),
  });
};

const welcomeEmail = async (email, name, planName) => {
  const content = `
    <h2>You're all set, ${name}! 🚀</h2>
    <p>Your <strong>${planName}</strong> plan is now active. Start building your first AI chatbot today!</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: 'Welcome to INTRA AI!',
    html: emailTemplate(content),
  });
};

module.exports = { verificationEmail, passwordResetEmail, welcomeEmail, sendEmail, };
