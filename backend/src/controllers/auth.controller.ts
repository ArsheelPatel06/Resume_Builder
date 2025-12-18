/**
 * Auth Controller
 * 
 * Manages user authentication including Registration, Login, and JWT Token verification.
 * Implements secure bcrypt password hashing.
 * 
 * @module Controllers/Auth
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface CustomRequest extends Request {
    user?: any;
}

export const signup = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { email, password, displayName } = req.body;

        if (!email || !password || !displayName) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: 'Email already in use' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            displayName
        });

        await newUser.save();

        const token = jwt.sign(
            { uid: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            uid: newUser._id,
            email: newUser.email,
            displayName: newUser.displayName,
            token
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Missing email or password' });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check if user has a password (might be missing if they used OAuth in a previous version, though we are resetting DB now)
        if (!user.password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { uid: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            uid: user._id,
            email: user.email,
            displayName: user.displayName,
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyToken = async (req: CustomRequest, res: Response): Promise<void> => {
    // Middleware already attached the user to req.user
    // We can just return the user info
    if (req.user) {
        const user = await User.findById(req.user.uid).select('-password');
        if (user) {
            res.status(200).json({ user });
            return;
        }
    }
    res.status(401).json({ message: 'Invalid token' });
};