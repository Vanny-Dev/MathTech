import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (err) {
            res.status(401).json({
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        res.status(401).json({
            message: 'Not authorized, no token'
        });
    }
};

// Only teacher can access

export const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    }
    else {
        res.status(403).json({
            message: 'Access denied: Teachers only'
        });
    }
};

// Only Students can access

export const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    }
    else {
        res.status(403).json({
            message: 'Access denied: Students only'
        });
    }
};