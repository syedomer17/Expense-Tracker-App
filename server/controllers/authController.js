import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

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
        const created = await User.create({
            fullName,
            email,
            password: hashPassword,
            profileImageUrl: profileImageUrl || null,
        });

        const safeUser = {
            id: created._id,
            fullName: created.fullName,
            email: created.email,
            profileImageUrl: created.profileImageUrl,
        };

        res.status(201).json({
            message: 'User registered successfully',
            user: safeUser,
            token: generateToken(created._id),
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

    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        };

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