import { useCallback, useEffect, useState  } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { can, hasAnyRole, hasRole } from '../utils/accessControl.ts';
import { userAccessUpdate } from '../api/modules/userApi.ts';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';

export const useAccess = () => {
    const [roles, setRoles] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<string[]>([]);

    const loadAccess = async () => {
        const storedRoles = JSON.parse(await AsyncStorage.getItem('roles') || '[]');
        const storedPermissions = JSON.parse(await AsyncStorage.getItem('permissions') || '[]');
        setRoles(storedRoles);
        setPermissions(storedPermissions);
    };

    useEffect(() => {
        loadAccess();
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                loadAccess();
            }
        });

        return () => subscription.remove();
    }, []);

    return {
        roles,
        permissions,
        hasRole: (r: string) => hasRole(roles, r),
        hasAnyRole: (r: string[]) => hasAnyRole(roles, r),
        can: (p: string) => can(permissions, p),
    };
};