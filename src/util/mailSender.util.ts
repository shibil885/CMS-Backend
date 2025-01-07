import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: 'rafacello885@gmail.com',
    pass: 'mnsa sstb gfzk tdct',
  },
});

export async function mailsendFn(to: string, subject: string, otp: number) {
  const htmlContent: string = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background-color:rgb(30, 80, 198); padding: 20px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px;">OTP Verification</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
          <p style="font-size: 18px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) is:</p>
          <div style="margin: 20px 0;">
            <h2 style="color: #ff6600; font-size: 36px; margin: 0;">${otp}</h2>
          </div>
          <p style="font-size: 14px; color: #555;">Please use this OTP to verify your account. The OTP is valid for <strong>60 sec</strong>.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; color: #777;">
          <p style="margin: 0;">If you did not request this, please ignore this email.</p>
          <p style="margin: 0;">Thanks</p>
        </div>
      </div>
    </div>`;

  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    html: htmlContent,
  });
  console.log('Message sent: %s', info.messageId);
  if (info) {
    return true;
  }
}
