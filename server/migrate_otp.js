import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database/ruralcare.db');

const db = new sqlite3.Database(dbPath);

console.log('Running OTP Migration...');

db.serialize(() => {
    db.run("ALTER TABLE users ADD COLUMN otp TEXT", (err) => {
        if (err && !err.message.includes("duplicate column")) console.error(err.message);
    });
    db.run("ALTER TABLE users ADD COLUMN otpExpiry DATETIME", (err) => {
        if (err && !err.message.includes("duplicate column")) console.error(err.message);
    });
    db.run("ALTER TABLE users ADD COLUMN isVerified BOOLEAN DEFAULT 0", (err) => {
        if (err && !err.message.includes("duplicate column")) console.error(err.message);
    });
    db.run("ALTER TABLE users ADD COLUMN otpAttempts INTEGER DEFAULT 0", (err) => {
        if (err && !err.message.includes("duplicate column")) console.error(err.message);
    });
});

db.close(() => {
    console.log('OTP Migration Finished.');
});
