import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import ApiError from "./ApiError.js";

const generateVerificationToken = async (userDetails) => {
  const token = await jwt.sign(
    userDetails,
    process.env.VERIFICATION_TOKEN_SECRET,
    {
      expiresIn: process.env.VERIFICATION_TOKEN_EXPIRY,
    }
  );

  return token;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMailVerification = async (userDetails, verificationURL) => {
  try {
    const verificationToken = await generateVerificationToken(userDetails);

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: {
        name: "Online-Library",
        address: process.env.SMTP_USER,
      }, // sender address
      to: userDetails.email, // list of receivers
      subject: "Verify User", // Subject link
      text: `Please click the following link to verify your email: VERIFY (This link will expire in ${process.env.VERIFICATION_TOKEN_EXPIRY} minutes)`, // plain text body
      html: `Please click the following link to verify your email: <a href="${verificationURL}/${verificationToken}">VERIFY</a> (This link will expire in ${process.env.VERIFICATION_TOKEN_EXPIRY} minutes)`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  } catch (error) {
    throw new ApiError(500, error);
  }
};
