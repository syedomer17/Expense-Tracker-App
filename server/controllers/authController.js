import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import env from "../config/env.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const jwtSecret = env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("Server misconfiguration: JWT_SECRET not set");
}

// 🔹 Token Generators
const generateAccessToken = (id) =>
  jwt.sign({ id }, jwtSecret, { expiresIn: "1d" });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, jwtSecret, { expiresIn: "7d" });

// 🔹 Helper: Build safe user object (no password/otp)
const buildSafeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  profileImageUrl: user.profileImageUrl || null,
});

// 🔹 Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

// ====================== REGISTER ======================
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, profileImageUrl } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // generate otp
    const otp = crypto.randomInt(100000, 999999);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const created = await User.create({
      fullName,
      email,
      password: hashPassword,
      otp,
      otpExpiresAt,
      otpCreatedAt: new Date(),
      emailVerified: false,
      profileImageUrl: profileImageUrl || null,
    });

    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: created.email,
      subject: "Verify your email",
      html: `<p>Your OTP for email verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });

    res.status(201).json({
      message: "Signup successful. OTP sent to your email.",
      user: buildSafeUser(created),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// ====================== LOGIN ======================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email & password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.emailVerified) {
      return res.status(401).json({ message: "Please verify your email first" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: buildSafeUser(user),
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user", error: error.message });
  }
};

// ====================== LOGOUT ======================
export const logoutUser = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

// ====================== VERIFY OTP ======================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Provide email & OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP not found. Request a new one" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expired. Request a new one" });
    }

    if (user.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.emailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
      user: buildSafeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

// ====================== RESEND OTP ======================
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = crypto.randomInt(100000, 999999);
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpCreatedAt = new Date();
    await user.save();

    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: user.email,
      subject: "Verify your email",
      html: `<p>Your OTP for email verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP", error: error.message });
  }
};

// ====================== GET USER INFO ======================
export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user: buildSafeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user info", error: error.message });
  }
};
