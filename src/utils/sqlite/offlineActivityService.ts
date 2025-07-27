import { getDb } from "./offlineService";

/**
 * Initializes the class_activities table if it doesn't exist.
 * @param {SQLiteDatabase} db - The database instance.
 */
export const initActivityTable = async (db) => {
    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS class_activities (
                                                        StudentActivityID TEXT PRIMARY KEY,
                                                        ClassID TEXT,
                                                        ActivityTypeID INTEGER,
                                                        DueDate TEXT,
                                                        Title TEXT,
                                                        Description TEXT,
                                                        created_at TEXT,
                                                        other_data TEXT,
                                                        synced INTEGER DEFAULT 0
        );
    `);
};

/**
 * Saves class activities offline into local SQLite storage.
 * @param {Array} activities - The list of activities to save.
 * @param {string} classId - The ID of the class to associate activities with.
 */
export const saveActivitiesOffline = async (activities = [], classId) => {
    const db = await getDb();
    await initActivityTable(db);

    const insertQueries = activities.map(item => {
        const activity = item.activity ?? {};

        return db.executeSql(
            `INSERT OR REPLACE INTO class_activities
            (StudentActivityID, ClassID, ActivityTypeID, DueDate, Title, Description, created_at, other_data, synced)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                item.StudentActivityID,
                classId,
                activity.ActivityTypeID ?? null,
                activity.DueDate ?? null,
                activity.Title ?? '',
                activity.Description ?? '',
                activity.created_at ?? null,
                JSON.stringify(item),
            ]
        );
    });

    try {
        await Promise.all(insertQueries);
    } catch (err) {
        console.error("Failed to save some activities:", err);
    }
};

export const getOfflineActivityById = async (StudentActivityID) => {
    const db = await getDb();
    await initActivityTable(db);

    try {
        const results = await db.executeSql(
            `SELECT * FROM class_activities WHERE StudentActivityID = ?`,
            [StudentActivityID]
        );
        const rows = results[0].rows;

        if (rows.length > 0) {
            const row = rows.item(0);
            try {
                return JSON.parse(row.other_data);
            } catch {
                return {
                    StudentActivityID: row.StudentActivityID,
                    activity: {
                        Title: row.Title,
                        Description: row.Description,
                        DueDate: row.DueDate,
                        ActivityTypeID: row.ActivityTypeID,
                        created_at: row.created_at
                    }
                };
            }
        }
        return null;
    } catch (err) {
        console.error("Failed to fetch activity by ID:", err);
        return null;
    }
};


export const getOfflineActivities = async ({ ClassID, ActivityTypeID }) => {
    const db = await getDb();
    await initActivityTable(db);

    let query = `SELECT * FROM class_activities WHERE ClassID = ?`;
    const params = [ClassID];

    if (ActivityTypeID !== undefined && ActivityTypeID !== null) {
        query += ` AND ActivityTypeID = ?`;
        params.push(ActivityTypeID);
    }

    try {
        const results = await db.executeSql(query, params);
        const rows = results[0].rows;
        const activityList = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            try {
                const parsed = JSON.parse(row.other_data);
                activityList.push(parsed);
            } catch {
                // Fallback if JSON parsing fails
                activityList.push({
                    StudentActivityID: row.StudentActivityID,
                    activity: {
                        Title: row.Title,
                        Description: row.Description,
                        DueDate: row.DueDate,
                        ActivityTypeID: row.ActivityTypeID,
                        created_at: row.created_at
                    }
                });
            }
        }

        return activityList;
    } catch (err) {
        console.error("Failed to fetch offline activities:", err);
        return [];
    }
};
