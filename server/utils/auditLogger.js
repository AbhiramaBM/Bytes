import { run } from '../config/db.js';

/**
 * Log a system action to the audit_logs table
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action description (e.g., 'LOGIN', 'CREATE_DOCTOR')
 * @param {object} details - Any additional metadata as a JSON object
 */
export const logAction = async (userId, action, details = {}) => {
    try {
        await run(
            'INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)',
            [userId, action, JSON.stringify(details)]
        );
    } catch (error) {
        console.error('Failed to log audit action:', error.message);
        // Don't throw; we don't want audit failure to break the main transaction
    }
};
