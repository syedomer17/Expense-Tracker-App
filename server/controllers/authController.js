import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';


const jwtSecret = env.JWT_SECRET;

const generateToken = (id) => {
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    return jwt.sign({ id }, jwtSecret, { expiresIn: '1d' });
}; 

// register user
export const registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body;

    // validation: check for missing data
    if (!fullName || !email || !password) {
        return res
            .status(400)
            .json({ message: 'Please fill in all required fields' });
    }

    // do not proceed if JWT secret is not configured
    if (!jwtSecret) {
        return res
            .status(500)
            .json({ message: 'Server misconfiguration: JWT secret missing' });
    }

    try {
        //check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // hash password and create the user
        const hashPassword = await bcrypt.hash(password, 10);

        //otp for email verification can be added here
        const otp = crypto.randomInt(100000, 999999);
        // otp expiry time 10 minutes
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpCreatedAt = new Date();

        // create user
        const created = await User.create({
            fullName,
            email,
            password: hashPassword,
            otp,
            otpExpiresAt,
            otpCreatedAt,
            emailVerified: false,
            profileImageUrl: profileImageUrl || null,
        });

        const safeUser = {
            id: created._id,
            fullName: created.fullName,
            email: created.email,
            profileImageUrl: created.profileImageUrl,
        };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.EMAIL_USER,
                pass: env.EMAIL_PASSWORD,
            },
        })

        await transporter.sendMail({
            from: env.EMAIL_USER,
            to: created.email,
            subject: 'Verify your email',
            html: `<p>Your OTP for email verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
        })

        res.status(201).json({
            message: 'Signup Successfully. OTP sent to the email for verification',
            user: safeUser,
        });

    } catch (error) {
        // handle duplicate key error
        if (error && error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// login user
export const loginUser = async (req,res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    if(!jwtSecret){
        return res.status(500).json({ message: 'Server misconfiguration: JWT secret missing' });
    }

    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        };

        if(user.emailVerified === false){
            return res.status(401).json({ message: 'Please verify your email to login' });
        }

        //comparing the password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const safeUser = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
        };
        res.status(200).json({
            user: safeUser,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user', error: error.message });
    }
}

// verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified === true) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please request a new one" });
    }

    const now = new Date();
    if (now > user.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one" });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // mark email as verified
    user.emailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    const safeUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    };

    res.status(200).json({
      message: "Email verified successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please provide email" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.emailVerified === true) {
            return res.status(400).json({ message: "Email already verified" });
        }
        // generate new otp
        const otp = crypto.randomInt(100000, 999999);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        const otpCreatedAt = new Date();
        
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        user.otpCreatedAt = otpCreatedAt;   
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.EMAIL_USER,
                pass: env.EMAIL_PASSWORD,
            },
        })

        await transporter.sendMail({
            from: env.EMAIL_USER,
            to: user.email,
            subject: 'Verify your email',
            html: `<p>Your OTP for email verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
        })

        res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error: error.message });
    }
}

// get user info
export const getUserInfo = async (req,res) => {
    try {
    const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user info', error: error.message });
    }
}