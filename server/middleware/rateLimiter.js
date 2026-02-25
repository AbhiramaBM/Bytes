import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/responseHandler.js';

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 100, // Limit each IP to 5 login attempts (100 in development)
    message: {
        status: 'error',
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    handler: (req, res, next, options) => {
        sendError(res, options.message.message, 429);
    },
    standardHeaders: true,
    legacyHeaders: false,
});
