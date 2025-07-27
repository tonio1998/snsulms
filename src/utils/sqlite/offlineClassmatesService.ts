import { getDb } from './offlineService';

export const initClassmatesTable = async () => {
    const db = await getDb();
    await db.executeSql(`
		CREATE TABLE IF NOT EXISTS classmates (
			id TEXT PRIMARY KEY,
			class_id TEXT,
			student_data TEXT
		);
	`);
};

export const saveClassmatesOffline = async (classmates = [], classID) => {
    const db = await getDb();
    await initClassmatesTable();

    try {
        for (const item of classmates) {
            const id = `${item?.student_info?.StudentID}-${classID}`;
            await db.executeSql(
                `INSERT OR REPLACE INTO classmates (id, class_id, student_data) VALUES (?, ?, ?)`,
                [
                    id,
                    classID,
                    JSON.stringify(item),
                ]
            );
        }
        console.log("✅ Classmates saved offline.");
    } catch (err) {
        console.warn("❌ Failed to save classmates offline:", err.message);
    }
};


export const getOfflineClassmates = async (classID, search = '') => {
    const db = await getDb();
    await initClassmatesTable();

    const results = await db.executeSql(
        `SELECT * FROM classmates WHERE class_id = ?`,
        [classID]
    );

    const rows = results?.[0]?.rows;
    if (!rows || rows.length === 0) {
        console.warn("📴 No classmates found in local DB.");
        return [];
    }

    const data = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        try {
            const parsed = JSON.parse(row.student_data);
            const s = search.trim().toLowerCase();

            if (s) {
                const match =
                    parsed?.student_info?.FirstName?.toLowerCase()?.includes(s) ||
                    parsed?.student_info?.LastName?.toLowerCase()?.includes(s) ||
                    parsed?.student_info?.user?.email?.toLowerCase()?.includes(s);
                if (match) data.push(parsed);
            } else {
                data.push(parsed);
            }
        } catch (err) {
            console.warn("❌ Failed to parse student_data row:", row);
        }
    }

    return data;
};
