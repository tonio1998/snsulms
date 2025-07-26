import { getDb } from './offlineService';
import { addStudent } from '../../api/studentsApi';
import { registerSyncHandler } from './syncManager';

export const initStudentsTable = async () => {
    const db = await getDb();

    await db.executeSql(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT,
            email TEXT,
			qr_code TEXT,
            fcm_token TEXT,
			other_data TEXT
		);
	`);

    try {
        await db.executeSql(`ALTER TABLE users ADD COLUMN synced INTEGER DEFAULT 0`);
    } catch (err) {
        // console.log("🟡 'synced' column already exists or couldn't be added.");
    }

};

export const getOfflineStudentById = async (id) => {
    const db = await getDb();
    const results = await db.executeSql(
        `SELECT * FROM users WHERE id = ? LIMIT 1`,
        [id]
    );
    const rows = results[0].rows;

    if (rows.length === 0) return null;

    try {
        return JSON.parse(rows.item(0).other_data);
    } catch (err) {
        // console.warn("⚠️ Failed to parse offline data:", err);
        return null;
    }
};

export const saveOfflineStudent = async (users) => {
    const db = await getDb();
    await initStudentsTable();

    await db.executeSql(
        `INSERT OR REPLACE INTO users (id, name, email, qr_code, fcm_token, other_data, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
            users.id,
            `${users.name}`,
            users.email || '',
            users.qr_code,
            users.fcm_token,
            JSON.stringify(users),
        ]
    );

    // console.log(`💾 Student saved offline (pending sync): ${student.FirstName} ${student.LastName}`);
};

export const saveUsersOffline = async (users) => {
    const db = await getDb();
    await initStudentsTable();

    const insertQueries = users.map(student => {
        return db.executeSql(
            `INSERT OR REPLACE INTO users (id, name, email, qr_code, fcm_token, other_data) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                users.id,
                `${users.name}`,
                users.email || '',
                users.qr_code,
                users.fcm_token,
                JSON.stringify(users),
            ]
        );
    });

    try {
        await Promise.all(insertQueries);
    } catch (err) {
        // console.error("❌ Failed to save students offline:", err);
    }
};


export const getOfflineUsers = async (filters) => {
    const db = await getDb();
    await initStudentsTable();

    let query = 'SELECT * FROM users';
    const where = [];
    const params = [];

    if (where.length > 0) {
        query += ` WHERE ${where.join(' AND ')}`;
    }

    const results = await db.executeSql(query, params);
    const rows = results[0].rows;
    const users = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        let parsed = {};
        try {
            parsed = JSON.parse(row.other_data);
        } catch {
            parsed = {
                id: row.id,
                name: row.name,
                email: row.email,
                qr_code: row.qr_code,
                fcm_token: row.fcm_token,
            };
        }

        // ✅ JS-level deep search
        if (filters.search) {
            const s = filters.search.toLowerCase();
            const match =
                parsed.name?.toLowerCase().includes(s) ||
                parsed.email?.toLowerCase().includes(s)

            if (match) {
                users.push(parsed);
            }
        } else {
            users.push(parsed);
        }
    }

    return users;
};


export const syncOfflineUsers = async () => {
    const db = await getDb();
    await initStudentsTable();

    const results = await db.executeSql(
        `SELECT * FROM users WHERE synced = 0`
    );

    const rows = results[0].rows;

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        const users = JSON.parse(row.other_data);

        try {
            const response = await addStudent(users);

            if (response?.data?.id) {
                await db.executeSql(
                    `UPDATE users SET synced = 1 WHERE id = ?`,
                    [users.id]
                );
                // console.log(`✅ Synced student: ${student.FirstName} ${student.LastName}`);
            }
        } catch (err) {
            // console.warn(`❌ Failed to sync student ID ${student.id}:`, err.message);
        }
    }
};
registerSyncHandler(syncOfflineUsers);