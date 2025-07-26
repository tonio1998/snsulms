import { getDb } from './offlineService';
import { addParents } from '../../api/parentsApi';
import { registerSyncHandler } from './syncManager';

export const initParentsTable = async () => {
    const db = await getDb();
    // await db.executeSql(`DROP TABLE IF EXISTS parents`);

    await db.executeSql(`
		CREATE TABLE IF NOT EXISTS parents (
			id TEXT PRIMARY KEY,
			name TEXT,
			phone TEXT,
			address TEXT,
			image TEXT,
			other_data TEXT,
			synced INTEGER DEFAULT 0
		);
	`);
};

export const saveOfflineParents = async (parents) => {
    const db = await getDb();
    await initParentsTable();

    await Promise.all(parents.map(parent =>
        db.executeSql(
            `INSERT OR REPLACE INTO parents (id, name, phone, address, image, other_data, synced)
			 VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [
                parent.id,
                `${parent.FirstName} ${parent.LastName}`,
                parent.PhoneNumber,
                parent.Address,
                parent.filepath || '',
                JSON.stringify(parent),
            ]
        )
    ));
    console.log(`💾 Cached ${parents.length} parents from API.`);
};

export const getOfflineParents = async (filters = {}) => {
    const db = await getDb();
    await initParentsTable();

    let query = `SELECT * FROM parents`;
    const params = [];

    if (filters.search) {
        query += ` WHERE name LIKE ?`;
        params.push(`%${filters.search}%`);
    }

    const results = await db.executeSql(query, params);
    const rows = results[0].rows;
    const offline = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        try {
            offline.push(JSON.parse(row.other_data));
        } catch {
            offline.push({
                id: row.id,
                PhoneNumber: row.phone,
                Address: row.address,
                FirstName: row.name.split(" ")[0],
                LastName: row.name.split(" ")[1],
                filepath: row.image
            });
        }
    }
    return offline;
};

export const saveOfflineParent = async (parent) => {
    const db = await getDb();
    await initParentsTable();

    await db.executeSql(
        `INSERT OR REPLACE INTO parents (id, name, phone, address, image, other_data, synced)
		 VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [
            parent.id,
            `${parent.FirstName} ${parent.LastName}`,
            parent.PhoneNumber,
            parent.Address,
            parent.filepath || '',
            JSON.stringify(parent),
        ]
    );
};

export const getOfflineParentById = async (id) => {
    const db = await getDb();
    await initParentsTable();

    const results = await db.executeSql(
        `SELECT * FROM parents WHERE id = ? LIMIT 1`,
        [id]
    );
    const rows = results[0].rows;

    if (rows.length === 0) return null;

    try {
        return JSON.parse(rows.item(0).other_data);
    } catch (err) {
        console.warn("⚠️ Failed to parse offline parent:", err.message);
        return null;
    }
};


export const syncOfflineParents = async () => {
    const db = await getDb();
    await initParentsTable();

    const results = await db.executeSql(`SELECT * FROM parents WHERE synced = 0`);
    const rows = results[0].rows;

    for (let i = 0; i < rows.length; i++) {
        const parent = JSON.parse(rows.item(i).other_data);

        try {
            const response = await addParents(parent);
            if (response?.data?.id) {
                await db.executeSql(`UPDATE parents SET synced = 1 WHERE id = ?`, [parent.id]);
                console.log(`✅ Synced parent ${parent.FirstName} ${parent.LastName}`);
            }
        } catch (err) {
            console.warn(`❌ Failed to sync parent ${parent.id}:`, err.message);
        }
    }
};

// Register sync handler globally
registerSyncHandler(syncOfflineParents);
