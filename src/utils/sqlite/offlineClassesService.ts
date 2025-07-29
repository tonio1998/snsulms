import {getDb} from "./offlineService";
import {registerSyncHandler} from "./syncManager";
import {useAuth} from "../../context/AuthContext.tsx";


export const initClassesTable = async () => {
    const db = await getDb();
    // await db.executeSql('DROP TABLE IF EXISTS lms_class_sections');
    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS lms_class_sections (
                                                          UserID TEXT,
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
                                                          synced INTEGER DEFAULT 0,
                                                          updatedAt TEXT
        );
    `);
};

export const saveClassesOffline = async (UserID, items, acad) => {
    const db = await getDb();
    await initClassesTable();

    const insertQueries = items.map(item => {
        return db.executeSql(
            `INSERT OR REPLACE INTO lms_class_sections
                (UserID, Semester, AYFrom, AYTo, other_data, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                UserID,
                acad.semester || '',
                acad.from || '',
                acad.to || '',
                JSON.stringify(item),
                acad.updatedAt || new Date().toISOString(),
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

    if (!filters.UserID) {
        console.error('❌ UserID is required to get offline classes.');
        return { data: [], updatedAt: null };
    }

    let query = 'SELECT * FROM lms_class_sections';
    const where = ['UserID = ?'];
    const params = [filters.UserID];

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

    query += ` WHERE ${where.join(' AND ')}`;

    try {
        const results = await db.executeSql(query, params);
        const rows = results[0].rows;
        const classes = [];

        let latestUpdatedAt = null;

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
                    AYTo: row.AYTo,
                };
            }

            if (filters.search) {
                const s = filters.search.toLowerCase();
                const match =
                    parsed.CourseCode?.toLowerCase().includes(s) ||
                    parsed.CourseName?.toLowerCase().includes(s) ||
                    parsed.Section?.toLowerCase().includes(s) ||
                    parsed.Teacher?.name?.toLowerCase().includes(s);

                if (match) classes.push(parsed);
            } else {
                classes.push(parsed);
            }

            // Track the latest updatedAt if stored
            if (row.updatedAt && (!latestUpdatedAt || row.updatedAt > latestUpdatedAt)) {
                latestUpdatedAt = row.updatedAt;
            }
        }

        return {
            data: classes,
            updatedAt: latestUpdatedAt,
        };
    } catch (err) {
        console.error('❌ Failed to fetch offline classes:', err);
        return { data: [], updatedAt: null };
    }
};


export const syncOfflineClasses = async (UserID) => {
    const db = await getDb();
    await initClassesTable();

    if (!UserID) {
        console.error("❌ UserID is required for syncing classes.");
        return;
    }

    const results = await db.executeSql(
        `SELECT * FROM lms_class_sections WHERE synced = 0 AND UserID = ?`,
        [UserID]
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
            const response = await addClass(classData);

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

registerSyncHandler(() => {
    const { user } = useAuth();
    return syncOfflineClasses(user?.id);
});
