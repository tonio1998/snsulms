import { getDb } from './offlineService';

export const initDashboardTable = async () => {
    const db = await getDb();
    await db.executeSql(`
		CREATE TABLE IF NOT EXISTS dashboard (
			id INTEGER PRIMARY KEY,
			key TEXT UNIQUE,
			data TEXT
		);
	`);
};

export const saveDashboardData = async (key: string, data: any) => {
    const db = await getDb();
    await initDashboardTable();

    await db.executeSql(
        `INSERT OR REPLACE INTO dashboard (key, data) VALUES (?, ?)`,
        [key, JSON.stringify(data)]
    );
    // console.log('📦 Dashboard data saved:', key);
};

export const getOfflineDashboard  = async (key: string) => {
    const db = await getDb();
    await initDashboardTable();

    const results = await db.executeSql(
        `SELECT data FROM dashboard WHERE key = ?`,
        [key]
    );

    if (results[0].rows.length > 0) {
        const raw = results[0].rows.item(0).data;
        return JSON.parse(raw);
    }
    return null;
};
