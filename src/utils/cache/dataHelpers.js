export const sortByDateDesc = (data = [], dateKey = 'updatedAt') => {
    return [...data].sort(
        (a, b) => new Date(b?.[dateKey] || 0).getTime() - new Date(a?.[dateKey] || 0).getTime()
    );
};

export const dedupeByKey = (array = [], key = 'id') => {
    const map = new Map();
    array.forEach((item) => {
        if (item?.[key] != null) map.set(item[key], item);
    });
    return Array.from(map.values());
};

export const setDedupedAndSorted = ({
                                        data = [],
                                        setter,
                                        uniqueKey = 'id',
                                        dateKey = 'updatedAt',
                                    }) => {
    const deduped = dedupeByKey(data, uniqueKey);
    const sorted = sortByDateDesc(deduped, dateKey);
    setter(sorted);
};
