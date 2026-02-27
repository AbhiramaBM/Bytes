import AuditLog from '../models/AuditLog.js';

/**
 * Log a system action to the AuditLog collection
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action description (e.g., 'LOGIN', 'CREATE_DOCTOR')
 * @param {object} details - Any additional metadata as a JSON object
 */
export const logAction = async (userId, action, details = {}) => {
    try {
        await AuditLog.create({
            userId,
            action,
            details
        });
    } catch (error) {
        console.error('Failed to log audit action:', error.message);
        // Don't throw; we don't want audit failure to break the main transaction
    }
};
