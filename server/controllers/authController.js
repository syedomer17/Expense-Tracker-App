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
        //checking if the email existing or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({ message: 'Email already exists' });
        }

        //hashing the password
        const hashPassword = await bcrypt.hash(password, 10);

        //new user 
        const user = {
            fullName,
            email,
            password: hashPassword,
            profileImageUrl,
        }

        await User.create(user);

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        })

    } catch (error) {
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

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user', error: error.message });
    }
}

// get user info
export const getUserInfo = async (req,res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user info', error: error.message });
    }
}