import SQLite from 'react-native-sqlite-storage';
const db = SQLite.openDatabase({ name: 'app.db' });

export const initTable = (tableName, columns) => {
    const colDefs = columns.map(c => `${c.name} ${c.type}`).join(', ');
    db.transaction(tx => {
        tx.executeSql(`DROP TABLE IF EXISTS ${tableName}`);
        tx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (${colDefs})`);
    });
};

export const upsertRows = (tableName, data, primaryKey, columns) => {
    const colNames = columns.map(c => c.name);
    const placeholders = colNames.map(() => '?').join(', ');

    db.transaction(tx => {
        data.forEach((item, index) => {
            const values = colNames.map(c => item[c]);
            console.log(`🔁 [${tableName}] Inserting row #${index + 1}:`, item);

            tx.executeSql(
                `INSERT OR REPLACE INTO ${tableName} (${colNames.join(', ')}) VALUES (${placeholders})`,
                values,
                () => console.log(`✅ Inserted into [${tableName}] → ${item[primaryKey]}`),
                (_, err) => {
                    console.error(`❌ Failed insert into [${tableName}]`, err);
                    return true;
                }
            );
        });
    });
};


export const getLocalData = (tableName) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM ${tableName}`,
                [],
                (_, { rows }) => resolve(rows._array),
                (_, err) => reject(err)
            );
        });
    });
};
