import SQLite from 'react-native-sqlite-storage';
import { syncTables } from '../constants/syncTables';

let db: SQLite.SQLiteDatabase;

export const getDB = () => db;

export const initDB = async () => {
	db = await SQLite.openDatabase({ name: 'offline.db', location: 'default' });
	
	for (const table of syncTables) {
		const columnsSql = Object.entries(table.columns)
			.map(([name, type]) => `${name} ${type}`)
			.join(', ');
		const createTableSQL = `CREATE TABLE IF NOT EXISTS ${table.name} (${columnsSql});`;
		await db.executeSql(createTableSQL);
	}
	
	return db;
};

export const insertDataToTable = async (table: string, rows: any[]) => {
	if (!rows || rows.length === 0) return;
	
	const keys = Object.keys(rows[0]);
	const placeholders = keys.map(() => '?').join(', ');
	const sql = `INSERT OR REPLACE INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
	
	for (const row of rows) {
		const values = keys.map(key => row[key]);
		
		// Monitoring the entry
		console.log(`Inserting into ${table}:`);
		console.log('SQL:', sql);
		console.log('Values:', values);
		
		try {
			await db.executeSql(sql, values);
		} catch (error) {
			console.error(`Error inserting into ${table}:`, error);
		}
	}
};


export const getUnsyncedData = async (table: string): Promise<any[]> => {
	const [results] = await db.executeSql(`SELECT * FROM ${table} WHERE synced = 0`);
	const rows = results.rows;
	const data: any[] = [];
	for (let i = 0; i < rows.length; i++) data.push(rows.item(i));
	return data;
};

export const markAsSynced = async (table: string, id: number) => {
	await db.executeSql(`UPDATE ${table} SET synced = 1 WHERE id = ?`, [id]);
};
