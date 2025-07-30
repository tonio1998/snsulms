import {inferColumnsFromData} from "../utils/columnUtils";
import {initTable, upsertRows} from "./genericSync";
import {fetchGenericData} from "../api/modules/auth";

export const autoSyncToOffline = async (tableName, endpoint, primaryKey = 'id') => {
    const data = await fetchGenericData(endpoint);
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn(`⚠️ No data for ${tableName}`);
        return;
    }

    const columns = inferColumnsFromData(data, primaryKey);

    await initTable(tableName, columns);
    await upsertRows(tableName, data, primaryKey, columns);

    console.log(`✅ Synced: ${tableName} (${data.length} records)`);
};

export const syncAllTables = async (tableConfigs) => {
    for (const config of tableConfigs) {
        await autoSyncToOffline(config.tableName, config.endpoint, config.primaryKey || 'id');
    }
};