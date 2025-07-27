import { registerSyncHandler } from './syncManager';
import { getDb } from './offlineService';

export const initClassesTable = async () => {
    const db = await getDb();

    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS lms_class_sections (
                                                          ClassStudentID TEXT PRIMARY KEY,
                                                          ClassID TEXT,
                                                          CourseCode TEXT,
                                                          CourseName TEXT,
                                                          Section TEXT,
                                                          Teacher TEXT,
                                                          Semester TEXT,
                                                          AYFrom TEXT,
                                                          AYTo TEXT,
                                                          other_data TEXT,
                                                          synced INTEGER DEFAULT 0
        );
    `);
};

export const saveClassOffline = async (item, acad) => {
    const db = await getDb();
    await initClassesTable();

    const classInfo = item.class_info ?? {};
    await db.executeSql(
        `INSERT OR REPLACE INTO lms_class_sections
        (ClassStudentID, ClassID, CourseCode, CourseName, Section, Teacher, Semester, AYFrom, AYTo, other_data, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
            item.ClassStudentID,
            classInfo.ClassID,
            classInfo.CourseCode,
            classInfo.CourseName,
            classInfo.Section,
            classInfo.teacher?.name || '',
            acad.semester || '',
            acad.from || '',
            acad.to || '',
            JSON.stringify(item)
        ]
    );
};

export const saveClassesOffline = async (items, acad) => {
    const db = await getDb();
    await initClassesTable();

    const insertQueries = items.map(item => {
        const classInfo = item.class_info ?? {};
        return db.executeSql(
            `INSERT OR REPLACE INTO lms_class_sections
            (ClassStudentID, ClassID, CourseCode, CourseName, Section, Teacher, Semester, AYFrom, AYTo, other_data, synced)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                item.ClassStudentID,
                classInfo.ClassID,
                classInfo.CourseCode,
                classInfo.CourseName,
                classInfo.Section,
                classInfo.teacher?.name || '',
                acad.semester || '',
                acad.from || '',
                acad.to || '',
                JSON.stringify(item)
            ]
        );
    });

    try {
        await Promise.all(insertQueries);
    } catch (err) {
        console.error("❌ Failed to save classes offline:", err);
    }
};

export const getOfflineClasses = async (filters = {}) => {
    const db = await getDb();
    await initClassesTable();

    let query = 'SELECT * FROM lms_class_sections';
    const where = [];
    const params = [];

    if (filters.Section) {
        where.push('Section = ?');
        params.push(filters.Section);
    }
    if (filters.Semester) {
        where.push('Semester = ?');
        params.push(filters.Semester);
    }
    if (filters.AYFrom) {
        where.push('AYFrom = ?');
        params.push(filters.AYFrom);
    }
    if (filters.AYTo) {
        where.push('AYTo = ?');
        params.push(filters.AYTo);
    }

    if (where.length > 0) {
        query += ` WHERE ${where.join(' AND ')}`;
    }

    const results = await db.executeSql(query, params);
    const rows = results[0].rows;
    const classes = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        let parsed;
        try {
            parsed = JSON.parse(row.other_data);
        } catch {
            parsed = {
                ClassStudentID: row.ClassStudentID,
                ClassID: row.ClassID,
                CourseCode: row.CourseCode,
                CourseName: row.CourseName,
                Section: row.Section,
                Teacher: row.Teacher,
                Semester: row.Semester,
                AYFrom: row.AYFrom,
                AYTo: row.AYTo
            };
        }

        if (filters.search) {
            const s = filters.search.toLowerCase();
            const match =
                parsed.class_info?.CourseCode?.toLowerCase().includes(s) ||
                parsed.class_info?.CourseName?.toLowerCase().includes(s) ||
                parsed.class_info?.Section?.toLowerCase().includes(s) ||
                parsed.class_info?.teacher?.name?.toLowerCase().includes(s);

            if (match) {
                classes.push(parsed);
            }
        } else {
            classes.push(parsed);
        }
    }

    return classes;
};

export const syncOfflineClasses = async () => {
    const db = await getDb();
    await initClassesTable();

    const results = await db.executeSql(
        `SELECT * FROM lms_class_sections WHERE synced = 0`
    );

    const rows = results[0].rows;

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        let classData;

        try {
            classData = JSON.parse(row.other_data);
        } catch (err) {
            console.warn(`⚠️ Failed to parse class data for ClassStudentID: ${row.ClassStudentID}`);
            continue;
        }

        try {
            const response = await addClass(classData); // Replace this with your real sync logic

            if (response?.data?.ClassID) {
                await db.executeSql(
                    `UPDATE lms_class_sections SET synced = 1 WHERE ClassStudentID = ?`,
                    [classData.ClassStudentID]
                );
                console.log(`✅ Synced class: ${classData.class_info?.CourseCode}`);
            }
        } catch (err) {
            console.warn(`❌ Failed to sync class ${classData.ClassStudentID}:`, err.message);
        }
    }
};

registerSyncHandler(syncOfflineClasses);
