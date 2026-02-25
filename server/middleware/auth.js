import { verifyToken, extractToken } from '../utils/tokenUtils.js';
import { sendError } from '../utils/responseHandler.js';

export const authenticate = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return sendError(res, 'No token provided', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return sendError(res, 'Invalid token', 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'Authentication failed', 401, error);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Not authorized', 403);
    }

    next();
  };
};
