import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const jwtSecret = process.env.JWT_SECRET;

const generateToken = (id) => {
    return jwt.sign({id}, jwtSecret,{expiresIn: '1d'});
}

export const registerUser = async (req,res) => {
    const { fullName, email, password} = req.body;
    
}

export const loginUser = async (req,res) => {

}

export const getUserInfo = async (req,res) => {
    
}