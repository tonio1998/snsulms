import { clearTable, insertBulkData } from './database';
import { tablesToSync } from '../constants/syncTables.ts';
import api from '../api/api.ts';

export const downloadAndStoreTables = async () => {
	for (const table of tablesToSync) {
		try {
			const response = await api.get(table.endpoint);
			const data = response.data;
			
			if (!Array.isArray(data)) {
				console.warn(`⚠️ Unexpected data for ${table.name}`);
				continue;
			}
			
			await clearTable(table.localTable);
			await insertBulkData(table.localTable, data, table.keys);
			console.log(`✅ ${table.name} synced and stored locally.`);
		} catch (err) {
			console.error(`❌ Failed syncing ${table.name}:`, err);
		}
	}
};
