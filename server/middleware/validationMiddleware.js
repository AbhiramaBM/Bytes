import dns from 'dns';
import { sendError } from '../utils/responseHandler.js';

// Regex for basic format validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Blacklisted disposable email domains
const DISPOSABLE_DOMAINS = [
    'mailinator.com', '10minutemail.com', 'temp-mail.org', 'guerrillamail.com',
    'yopmail.com', 'sharklasers.com', 'dispostable.com', 'burners.com'
];

/**
 * Advanced Email Validation: Format + Disposable check + MX record check
 */
export const validateEmail = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(); // Let required field check handle missing email

    const cleanEmail = email.toLowerCase().trim();
    const domain = cleanEmail.split('@')[1];

    // 1. Format check
    if (!EMAIL_REGEX.test(cleanEmail)) {
        return sendError(res, 'Invalid email format', 400);
    }

    // 2. Disposable domain check
    if (DISPOSABLE_DOMAINS.includes(domain)) {
        return sendError(res, 'Temporary or disposable email addresses are not allowed', 400);
    }

    // 3. MX Record check (only if not in local dev or explicitly requested)
    // Note: This might be slow if DNS is laggy. We'll wrap in a timeout.
    try {
        const mxRecords = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('DNS Timeout')), 2000);
            dns.resolveMx(domain, (err, addresses) => {
                clearTimeout(timeout);
                if (err) {
                    // If no MX record, check A record as backup
                    dns.resolve(domain, 'A', (err2, addresses2) => {
                        if (err2) reject(err2);
                        else resolve(addresses2);
                    });
                } else {
                    resolve(addresses);
                }
            });
        });

        if (!mxRecords || mxRecords.length === 0) {
            return sendError(res, 'Invalid email domain (No mail servers found)', 400);
        }
    } catch (error) {
        console.warn(`Email domain validation failed for ${domain}:`, error.message);
        // We might want to allow it if it's just a timeout, but if it's "NOTFOUND", reject.
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            return sendError(res, 'The provided email domain does not exist', 400);
        }
    }

    req.body.email = cleanEmail; // Ensure subsequent handlers use clean email
    next();
};

/**
 * Helper to normalize time strings to HH:MM format
 * Handles: H:M, HH:MM, H:M AM/PM, HH:MM:SS, etc.
 */
const normalizeTime = (timeStr) => {
    if (!timeStr) return null;
    console.log('[DEBUG] Normalizing Time:', timeStr);

    // Remove all whitespace and make uppercase
    const clean = timeStr.trim().toUpperCase();

    // Support various separators and optional seconds/AM/PM
    const match = clean.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(AM|PM)?$/);
    if (!match) {
        console.warn('[DEBUG] No regex match for time string:', clean);
        return null;
    }

    let [_, hours, minutes, modifier] = match;
    let h = parseInt(hours, 10);
    const m = minutes.padStart(2, '0');

    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;

    const result = `${h.toString().padStart(2, '0')}:${m}`;
    console.log('[DEBUG] Normalized Result:', result);
    return result;
};

/**
 * Appointment Validation: Past dates, clinic hours, format
 */
export const validateAppointment = (req, res, next) => {
    const { appointmentDate, appointmentTime } = req.body;
    console.log('[DEBUG] validateAppointment Body:', { appointmentDate, appointmentTime });

    if (!appointmentDate || !appointmentTime) return next();

    // 1. Normalize and validate format
    const normalizedTime = normalizeTime(appointmentTime);

    if (!normalizedTime) {
        return sendError(res, 'Invalid time format. Please use 24-hour HH:MM format.', 400);
    }

    // Update req.body with normalized time for consistency across downstream handlers
    req.body.appointmentTime = normalizedTime;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointmentDate)) {
        return sendError(res, 'Invalid date format (Expect YYYY-MM-DD)', 400);
    }

    // 2. Past date/time check
    const now = new Date();
    const bookingDate = new Date(`${appointmentDate}T${normalizedTime}`);

    if (isNaN(bookingDate.getTime())) {
        return sendError(res, 'Invalid date or time provided', 400);
    }

    if (bookingDate < now) {
        return sendError(res, 'Cannot book appointments in the past', 400);
    }

    // 3. Clinic Hours Check (09:00 to 18:00)
    const [hours, minutes] = normalizedTime.split(':').map(Number);
    if (hours < 9 || hours >= 18) {
        return sendError(res, 'Please select a valid 30-minute slot between 09:00 and 18:00.', 400);
    }

    // 4. 30-minute slot logic
    if (minutes !== 0 && minutes !== 30) {
        return sendError(res, 'Please select a valid 30-minute slot between 09:00 and 18:00.', 400);
    }

    next();
};
