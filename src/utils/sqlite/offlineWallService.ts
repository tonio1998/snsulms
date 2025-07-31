import {getDb} from "./offlineService";

export const initWallTable = async () => {
    const db = await getDb();
    // await db.executeSql(`DROP TABLE IF EXISTS class_wall_posts`);
    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS class_wall_posts (
                                                        id TEXT PRIMARY KEY,
                                                        ClassID TEXT,
                                                        body TEXT,
                                                        created_by TEXT,
                                                        created_at TEXT,
                                                        UpdatedAt TEXT,
                                                        other_data TEXT,
                                                        synced INTEGER DEFAULT 0
        );
    `);
};

/**
 * Save wall posts locally
 */
export const saveWallOffline = async (posts = [], classId) => {
    const db = await getDb();
    await initWallTable();

    const insertQueries = posts.map(post => {
        return db.executeSql(
            `INSERT OR REPLACE INTO class_wall_posts
            (id, ClassID, body, created_by, created_at, UpdatedAt, other_data, synced)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                post.id,
                classId,
                post.body,
                JSON.stringify(post.created_by),
                post.created_at,
                post.UpdatedAt || post.created_at,
                JSON.stringify(post),
                0
            ]
        );
    });

    await Promise.all(insertQueries);
};

/**
 * Get wall posts locally, with optional search filter
 */
export const getOfflineWall = async (filters = {}) => {
    const db = await getDb();
    await initWallTable();

    let query = `SELECT * FROM class_wall_posts WHERE ClassID = ?`;
    const params = [filters.ClassID];

    if (filters.search) {
        query += ` AND body LIKE ? COLLATE BINARY`;
        params.push(`%${filters.search}%`);
    }

    query += ` ORDER BY COALESCE(UpdatedAt, created_at) DESC`;

    const results = await db.executeSql(query, params);
    const rows = results[0].rows;
    const wallPosts = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        try {
            const parsed = JSON.parse(row.other_data);
            wallPosts.push(parsed);
        } catch {
            wallPosts.push({
                id: row.id,
                body: row.body,
                created_by: JSON.parse(row.created_by),
                created_at: row.created_at,
                UpdatedAt: row.UpdatedAt
            });
        }
    }

    return wallPosts;
};


/**
 * Save wall post comments offline for a specific postId
 */
export const saveWallCommentsOffline = async (postId, comments) => {
    const db = await getDb();
    await db.transaction(async tx => {
        await tx.executeSql(
            `CREATE TABLE IF NOT EXISTS WallComments (
                                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         postId TEXT,
                                                         commentId TEXT,
                                                         name TEXT,
                                                         avatar TEXT,
                                                         profile_pic TEXT,
                                                         content TEXT,
                                                         created_at TEXT,
                                                         UpdatedAt TEXT
             )`
        );

        // Clear old comments for the post
        await tx.executeSql(`DELETE FROM WallComments WHERE postId = ?`, [postId]);

        // Insert new comments
        for (let c of comments) {
            const user = c.created_by || {};
            const results = await tx.executeSql(
                `INSERT INTO WallComments
                 (postId, commentId, name, avatar, profile_pic, content, created_at, UpdatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    postId,
                    c.id,
                    user.name || '',
                    user.avatar || '',
                    user.profile_pic || '',
                    c.content,
                    c.created_at,
                    c.UpdatedAt || c.created_at
                ]
            );

            console.log('comment saved:', results);
        }
    });
};

/**
 * Get comments from local DB for a postId
 */
export const getOfflineWallComments = async (postId) => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM WallComments WHERE postId = ? ORDER BY id DESC`,
                [postId],
                (_, { rows }) => {
                    const result = [];
                    for (let i = 0; i < rows.length; i++) {
                        result.push(rows.item(i));
                    }
                    resolve(result);
                },
                (_, error) => {
                    console.error("[Failed to load comments]", error);
                    reject(error);
                }
            );
        });
    });
};