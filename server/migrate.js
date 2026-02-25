import { v4 as uuidv4 } from 'uuid';
import db from './config/db.js';

const migrate = async () => {
    console.log('🚀 Starting surgical database migration (Final Verification)...');

    const run = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(`❌ Error executing SQL: ${sql}`);
                console.error(err.message);
                reject(err);
            }
            else resolve();
        });
    });

    const get = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    const query = (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    try {
        await run('PRAGMA foreign_keys = OFF');
        await run('BEGIN TRANSACTION');

        // 1. Audit Logs
        await run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT,
            action TEXT NOT NULL,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`);

        // 2. Patients Table
        console.log('📦 Creating/Populating patients table...');
        await run(`CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            medicalHistory TEXT,
            bloodGroup TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        const pUsers = await query("SELECT id FROM users WHERE role = 'patient'");
        for (const u of pUsers) {
            const exists = await get("SELECT id FROM patients WHERE user_id = ?", [u.id]);
            if (!exists) {
                await run("INSERT INTO patients (id, user_id) VALUES (?, ?)", [uuidv4(), u.id]);
            }
        }

        // 3. Doctors Table
        const dInfo = await query("PRAGMA table_info(doctors)");
        const dCols = dInfo.map(c => c.name);
        if (dCols.includes('userId')) {
            console.log('👨‍⚕️ Normalizing doctors...');
            await run(`CREATE TABLE doctors_new (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                specialization TEXT,
                experience TEXT,
                registrationNumber TEXT UNIQUE,
                consultationFee REAL,
                isActive BOOLEAN DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`);

            await run(`INSERT INTO doctors_new (id, user_id, specialization, experience, registrationNumber, consultationFee, isActive, createdAt, updatedAt)
                       SELECT id, userId, IFNULL(specialization, ''), IFNULL(experience, ''), IFNULL(registrationNumber, registration), IFNULL(consultationFee, 0), 1, createdAt, IFNULL(createdAt, CURRENT_TIMESTAMP)
                       FROM doctors`);
            await run('DROP TABLE doctors');
            await run('ALTER TABLE doctors_new RENAME TO doctors');
        }

        // 4. Appointments Table
        const aInfo = await query("PRAGMA table_info(appointments)");
        const aCols = aInfo.map(c => c.name);
        if (aCols.includes('patientId')) {
            console.log('📅 Normalizing appointments...');
            await run(`CREATE TABLE appointments_new (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                doctor_id TEXT NOT NULL,
                clinic_id TEXT,
                appointmentDate TEXT,
                appointmentTime TEXT,
                status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'appointed', 'completed')),
                reason TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
                FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL,
                UNIQUE(doctor_id, appointmentDate, appointmentTime)
            )`);

            await run(`
                INSERT INTO appointments_new (id, patient_id, doctor_id, clinic_id, appointmentDate, appointmentTime, status, reason, createdAt, updatedAt)
                SELECT a.id, p.id, a.doctorId, a.clinicId, a.appointmentDate, a.appointmentTime, a.status, a.reason, a.createdAt, IFNULL(a.updatedAt, a.createdAt)
                FROM appointments a
                JOIN patients p ON a.patientId = p.user_id
            `);
            await run('DROP TABLE appointments');
            await run('ALTER TABLE appointments_new RENAME TO appointments');
        }

        // 5. Prescriptions & Medicines
        const prInfo = await query("PRAGMA table_info(prescriptions)");
        const prCols = prInfo.map(c => c.name);
        if (prCols.includes('appointmentId')) {
            console.log('📝 Normalizing prescriptions...');
            await run(`CREATE TABLE prescriptions_new (
                id TEXT PRIMARY KEY,
                appointment_id TEXT UNIQUE NOT NULL,
                patient_id TEXT NOT NULL,
                doctor_id TEXT NOT NULL,
                diagnosis TEXT,
                notes TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
                FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
            )`);

            await run(`
                INSERT INTO prescriptions_new (id, appointment_id, patient_id, doctor_id, diagnosis, notes, createdAt, updatedAt)
                SELECT pr.id, pr.appointmentId, pa.id, pr.doctorId, 'Migrated diagnosis', IFNULL(instructions, ''), pr.createdAt, pr.createdAt
                FROM prescriptions pr
                JOIN patients pa ON pr.patientId = pa.user_id
            `);

            // Migrate medicines to normalized table
            await run(`CREATE TABLE IF NOT EXISTS pm_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prescription_id TEXT NOT NULL,
                name TEXT NOT NULL,
                dosage TEXT,
                duration TEXT,
                FOREIGN KEY (prescription_id) REFERENCES prescriptions_new(id) ON DELETE CASCADE
            )`);

            // If old prescriptions had direct medicine columns, move them
            if (prCols.includes('medicines')) {
                await run(`INSERT INTO pm_new (prescription_id, name, dosage, duration)
                           SELECT id, medicines, dosage, duration FROM prescriptions WHERE medicines IS NOT NULL AND medicines != ''`);
            }

            // Also migrate existing prescription_medicines if table exists and has data
            const pmOldExists = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='prescription_medicines'");
            if (pmOldExists) {
                const pmOldCols = await query("PRAGMA table_info(prescription_medicines)");
                const pidCol = pmOldCols.map(c => c.name).includes('prescriptionId') ? 'prescriptionId' : 'prescription_id';
                await run(`INSERT INTO pm_new (prescription_id, name, dosage, duration)
                           SELECT ${pidCol}, name, dosage, duration FROM prescription_medicines`);
                await run('DROP TABLE prescription_medicines');
            }

            await run('DROP TABLE prescriptions');
            await run('ALTER TABLE prescriptions_new RENAME TO prescriptions');
            await run('ALTER TABLE pm_new RENAME TO prescription_medicines');
        }

        await run('COMMIT');
        await run('PRAGMA foreign_keys = ON');
        console.log('🎉 Final Senior Architect Migration completed successfully!');
    } catch (err) {
        await run('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
    } finally {
        process.exit();
    }
};

migrate();
