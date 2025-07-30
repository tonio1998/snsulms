import { getDb } from "./offlineService";

/**
 * Initializes the class_activities table if it doesn't exist.
 * @param {SQLiteDatabase} db - The database instance.
 */
export const initActivityTable = async (db) => {
    // await db.executeSql(`DROP TABLE IF EXISTS class_activities`);
    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS class_activities (
                                                        ActivityID INTEGER PRIMARY KEY,
                                                        ClassID INTEGER,
                                                        ExamID INTEGER,
                                                        QuizID INTEGER,
                                                        Title TEXT,
                                                        Description TEXT,
                                                        TeacherID INTEGER,
                                                        Points INTEGER,
                                                        StrictLate INTEGER,
                                                        Graded INTEGER,
                                                        other_data TEXT,
                                                        synced INTEGER
        )
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

    // 🧹 Deduplicate by ActivityID
    const dedupedActivities = Object.values(
        activities.reduce((acc, curr) => {
            acc[curr.ActivityID] = curr;
            return acc;
        }, {})
    );

    const queries = dedupedActivities.map(item => {
        return db.executeSql(
            `INSERT INTO class_activities
				(ActivityID, ClassID, ExamID, QuizID, Title, Description, TeacherID, Points, StrictLate, Graded, other_data, synced)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
			ON CONFLICT(ActivityID)
			DO UPDATE SET
				ClassID = excluded.ClassID,
				ExamID = excluded.ExamID,
				QuizID = excluded.QuizID,
				Title = excluded.Title,
				Description = excluded.Description,
				TeacherID = excluded.TeacherID,
				Points = excluded.Points,
				StrictLate = excluded.StrictLate,
				Graded = excluded.Graded,
				other_data = excluded.other_data,
				synced = 0`,
            [
                item.ActivityID,
                classId,
                item.ExamID ?? null,
                item.QuizID ?? null,
                item.Title ?? '',
                item.Description ?? '',
                item.TeacherID ?? null,
                item.Points ?? 0,
                item.StrictLate ?? null,
                item.Graded ?? null,
                JSON.stringify(item),
            ]
        );
    });

    try {
        await Promise.all(queries);
    } catch (err) {
        console.error("🚨 Error saving activities offline:", err);
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
        // console.error("Failed to fetch activity by ID:", err);
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
