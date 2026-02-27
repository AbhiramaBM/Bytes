import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;

const initTransporter = async () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail', // You can change this to any SMTP service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        console.log('📧 No EMAIL_USER found in .env, generating testing account via Ethereal Email...');
        let testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

export const sendOTP = async (toEmail, otp) => {
    if (!transporter) {
        transporter = await initTransporter();
    }

    const mailOptions = {
        from: process.env.EMAIL_USER || '"RuralCare Connect" <no-reply@ruralcare.test>',
        to: toEmail,
        subject: 'Your OTP for RuralCare Connect Account Verification',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for registering with RuralCare Connect.</p>
        <p>Your One-Time Password (OTP) for account verification is:</p>
        <h1 style="color: #4A90E2; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        <br>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${toEmail}`);

        // If we used a test account, log the URL to preview the email
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`📩 PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`);
            console.log(`🔑 DEVELOPMENT OTP: ${otp}`);
        }

        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
};
