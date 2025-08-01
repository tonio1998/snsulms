import {getDb} from "./offlineService";
import {handleApiError} from "../errorHandler.ts";
import {addClassAttendance} from "../../api/modules/classesApi.ts";

export const initAttendanceTable = async () => {
    const db = await getDb();
    await db.executeSql(`
		CREATE TABLE IF NOT EXISTS attendance (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			student_id TEXT NOT NULL,
			class_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			scanned_at TEXT NOT NULL
		);
	`);
};

export const saveAttendanceOffline = async (record) => {
    try {
        await initAttendanceTable();
        const db = await getDb();
        await db.executeSql(
            `INSERT INTO attendance (student_id, class_id, user_id, scanned_at) VALUES (?, ?, ?, ?)`,
            [record.student_id, record.class_id, record.user_id, record.scanned_at]
        );
    } catch (err) {
        console.error('Failed to save attendance offline:', err);
    }
};

export const syncOfflineAttendance = async () => {
    await initAttendanceTable();
    try {
        const db = await getDb();
        const [result] = await db.executeSql(`SELECT * FROM attendance`);
        const rows = result.rows;
        const unsynced = [];

        for (let i = 0; i < rows.length; i++) {
            unsynced.push(rows.item(i));
        }

        for (const item of unsynced) {
            try {
                await addClassAttendance({
                    student_id: item.student_id,
                    class_id: item.class_id,
                    user_id: item.user_id,
                    scanned_at: item.scanned_at,
                });

                // remove synced record
                await db.executeSql(`DELETE FROM attendance WHERE id = ?`, [item.id]);
            } catch (err) {
                handleApiError(err, 'Attendance sync failed');
                // leave record in DB for retry
            }
        }
    } catch (err) {
        console.error('Failed to sync attendance:', err);
    }
};