import { getDb } from './offlineService';
import { addStudent } from '../../api/studentsApi';
import { registerSyncHandler } from './syncManager';

export const initStudentsTable = async () => {
    const db = await getDb();

    await db.executeSql(`
		CREATE TABLE IF NOT EXISTS students (
			id TEXT PRIMARY KEY,
			name TEXT,
			qr_code TEXT,
			year_level TEXT,
			other_data TEXT
		);
	`);

    try {
        await db.executeSql(`ALTER TABLE students ADD COLUMN synced INTEGER DEFAULT 0`);
    } catch (err) {
        // console.log("🟡 'synced' column already exists or couldn't be added.");
    }

};

export const getOfflineStudentById = async (id) => {
    const db = await getDb();
    const results = await db.executeSql(
        `SELECT * FROM students WHERE id = ? LIMIT 1`,
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

export const saveOfflineStudent = async (student) => {
    const db = await getDb();
    await initStudentsTable();

    await db.executeSql(
        `INSERT OR REPLACE INTO students (id, name, qr_code, year_level, other_data, synced) VALUES (?, ?, ?, ?, ?, 0)`,
        [
            student.id,
            `${student.FirstName} ${student.LastName}`,
            student.qr_code || '',
            student.YearLevel,
            JSON.stringify(student),
        ]
    );

    // console.log(`💾 Student saved offline (pending sync): ${student.FirstName} ${student.LastName}`);
};

export const saveStudentsOffline = async (students) => {
    const db = await getDb();
    await initStudentsTable();

    const insertQueries = students.map(student => {
        return db.executeSql(
            `INSERT OR REPLACE INTO students (id, name, qr_code, year_level, other_data) VALUES (?, ?, ?, ?, ?)`,
            [
                student.id,
                student.name,
                student.qr_code,
                student.year_level,
                JSON.stringify(student),
            ]
        );
    });

    try {
        await Promise.all(insertQueries);
    } catch (err) {
        // console.error("❌ Failed to save students offline:", err);
    }
};


export const getOfflineStudents = async (filters) => {
    const db = await getDb();
    await initStudentsTable();

    let query = 'SELECT * FROM students';
    const where = [];
    const params = [];

    // Only filter year_level in SQL
    if (filters.YearLevel) {
        where.push('year_level = ?');
        params.push(filters.YearLevel);
    }

    if (where.length > 0) {
        query += ` WHERE ${where.join(' AND ')}`;
    }

    const results = await db.executeSql(query, params);
    const rows = results[0].rows;
    const students = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        let parsed = {};
        try {
            parsed = JSON.parse(row.other_data);
        } catch {
            parsed = {
                id: row.id,
                name: row.name,
                qr_code: row.qr_code,
                year_level: row.year_level,
            };
        }

        // ✅ JS-level deep search
        if (filters.search) {
            const s = filters.search.toLowerCase();
            const match =
                parsed.FirstName?.toLowerCase().includes(s) ||
                parsed.LastName?.toLowerCase().includes(s) ||
                parsed.MiddleName?.toLowerCase().includes(s) ||
                parsed.LRN?.toLowerCase().includes(s) ||
                parsed.Section?.toLowerCase().includes(s) ||
                parsed.PhoneNumber?.toLowerCase().includes(s);

            if (match) {
                students.push(parsed);
            }
        } else {
            students.push(parsed);
        }
    }

    console.log("from local: ", students);
    return students;
};


export const syncOfflineStudents = async () => {
    const db = await getDb();
    await initStudentsTable();

    const results = await db.executeSql(
        `SELECT * FROM students WHERE synced = 0`
    );

    const rows = results[0].rows;

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        const student = JSON.parse(row.other_data);

        try {
            const response = await addStudent(student);

            if (response?.data?.id) {
                await db.executeSql(
                    `UPDATE students SET synced = 1 WHERE id = ?`,
                    [student.id]
                );
                // console.log(`✅ Synced student: ${student.FirstName} ${student.LastName}`);
            }
        } catch (err) {
            // console.warn(`❌ Failed to sync student ID ${student.id}:`, err.message);
        }
    }
};
registerSyncHandler(syncOfflineStudents);