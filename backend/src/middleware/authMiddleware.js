import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verify the bearer token AND that the account behind it still exists.
 *
 * The account check is the important half. A JWT stays cryptographically valid
 * for its whole seven-day life, so a student whose account a teacher deleted
 * kept full access until the token happened to expire: the middleware set
 * `req.user` to null and called next() anyway, and every route downstream
 * carried on. Looking the user up on each request is what actually invalidates
 * a deleted account's session, without needing a token blacklist.
 *
 * Each branch returns, so a request can never both continue and be answered.
 */
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, no token'
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            message: 'Not authorized, token failed'
        });
    }

    try {
        const user = await User.findById(decoded.id).select('-password');

        // Deleted account: the token is still signed correctly, but there is
        // no longer anyone to authorise. 401 rather than 403 so the client
        // clears the stored session and sends the user back to login.
        if (!user) {
            return res.status(401).json({
                message: 'This account no longer exists'
            });
        }

        req.user = user;
        return next();
    } catch (err) {
        return next(err);
    }
};

// Only teacher can access

export const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        return next();
    }
    return res.status(403).json({
        message: 'Access denied: Teachers only'
    });
};

// Only Students can access

export const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        return next();
    }
    return res.status(403).json({
        message: 'Access denied: Students only'
    });
};
