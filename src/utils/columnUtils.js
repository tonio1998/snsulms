export const inferColumnsFromData = (data, primaryKey = 'id') => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const sample = data[0];
    return Object.keys(sample).map(key => ({
        name: key,
        type: key === primaryKey ? 'TEXT PRIMARY KEY' : 'TEXT',
    }));
};
