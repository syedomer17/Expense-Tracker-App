import User from "../models/User.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from 'bcryptjs';
import env from "../config/env.js";

// Request OTP for password reset

export const request_otp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        res.status(400).json({message: "Email is required"});
        return;
    }

    const user = await User.findOne({email});

    if(!user){
        res.status(404).json({message: "User not found."})
    }

    const otp = crypto.randomInt(100000, 999999);

    user.otp = otp;
    user.otpCreatedAt = new Date();
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    user.passwordResetVerified = false;

    await user.save();
    
    // Send OTP via email
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: env.EMAIL_USER,
        to: email,
        subject: 'Your Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
    });

    res.status(200).json({message: "OTP sent to your email."});
}

export const verify_otp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "No OTP request found. Please request a new OTP." });
    }

    const now = new Date();
    if (now > user.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new OTP." });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // mark that user has passed OTP verification
    user.passwordResetVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const reset_password = async (req, res) => {
    const {email, newPassword, confirmPassword} = req.body;

    if(!email || !newPassword || !confirmPassword){
        res.status(400).json({message: "All fields are required"});
        return;
    }

    if(newPassword !== confirmPassword){
        res.status(400).json({message: "Passwords do not match"});
        return;
    }

    const user = await User.findOne({email});

    if(!user){
        res.status(404).json({message: "User not found."})
    }

    if(user.passwordResetVerified === false){
        res.status(400).json({message: "OTP verification required before resetting password."});
        return;
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.otp = null;
    user.otpCreatedAt = null;
    user.otpExpiresAt = null;
    user.passwordResetVerified = false;

    await user.save();

    res.status(200).json({message: "Password reset successfully."});
}