import { navigationRef } from '../utils/navigation.ts';

let pendingNavigation: { name: string; params?: any } | null = null;

export function navigate(name: string, params?: any) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name as never, params as never);
    } else {
        console.warn('Navigation not ready – queuing');
        pendingNavigation = { name, params };
    }
}

export function tryFlushPendingNavigation() {
    if (navigationRef.isReady() && pendingNavigation) {
        const { name, params } = pendingNavigation;
        navigationRef.navigate(name as never, params as never);
        pendingNavigation = null;
    }
}
