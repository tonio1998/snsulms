import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db = null;

export const getDb = async () => {
    if (!db) {
        db = await SQLite.openDatabase({ name: 'tnhs.db', location: 'default' });
    }
    return db;
};
