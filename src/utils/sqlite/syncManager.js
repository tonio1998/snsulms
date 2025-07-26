const syncQueue = [];
export const registerSyncHandler = (handler) => {
    if (typeof handler === 'function') {
        syncQueue.push(handler);
    }
};

export const triggerAllSyncs = async () => {
    for (const handler of syncQueue) {
        try {
            await handler();
        } catch (err) {
        }
    }
};
