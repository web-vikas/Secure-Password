import nodemailer from "nodemailer"

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Send TOTP code
export async function sendTOTPEmail(email: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"SecurePass" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Your One-Time Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your One-Time Password</h2>
        <p>Use the following code to log in to your SecurePass account:</p>
        <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  })
}

// Send password shared notification
export async function sendPasswordSharedEmail(email: string, passwordName: string, shareLink: string): Promise<void> {
  await transporter.sendMail({
    from: `"SecurePass" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Password Shared",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Shared</h2>
        <p>You have shared the password "${passwordName}" with someone.</p>
        <p>They can access it using this link:</p>
        <p><a href="${shareLink}">${shareLink}</a></p>
        <p>This link will expire after one hour or after the first access, whichever comes first.</p>
      </div>
    `,
  })
}

// Send password accessed notification
export async function sendPasswordAccessedEmail(email: string, passwordName: string): Promise<void> {
  await transporter.sendMail({
    from: `"SecurePass" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Password Accessed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Accessed</h2>
        <p>Your shared password "${passwordName}" has been accessed.</p>
        <p>The shared link has now been deactivated.</p>
        <p>If you did not expect this, please change your password immediately.</p>
      </div>
    `,
  })
}

