import { getDB } from './database.ts';

export const getUnsyncedData = async (table: string): Promise<any[]> => {
	const db = getDB();
	const [results] = await db.executeSql(`SELECT * FROM ${table} WHERE synced = 0`);
	const data: any[] = [];
	const rows = results.rows;
	for (let i = 0; i < rows.length; i++) data.push(rows.item(i));
	return data;
};

export const markAsSynced = async (table: string, id: number) => {
	const db = getDB();
	await db.executeSql(`UPDATE ${table} SET synced = 1 WHERE id = ?`, [id]);
};

export const insertDataToTable = async (table: string, rows: any[]) => {
	const db = getDB();
	if (!rows || rows.length === 0) return;
	const keys = Object.keys(rows[0]);
	const placeholders = keys.map(() => '?').join(', ');
	const sql = `INSERT OR REPLACE INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
	
	for (const row of rows) {
		const values = keys.map(key => row[key]);
		await db.executeSql(sql, values);
	}
};
