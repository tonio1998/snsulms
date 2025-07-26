import React, { createContext, useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAccessUpdate } from '../api/modules/userApi.ts';

type AccessContextType = {
    roles: string[];
    permissions: string[];
    can: (perm: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
};

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const AccessProvider = ({ children }: { children: React.ReactNode }) => {
    const [roles, setRoles] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<string[]>([]);

    const loadFromStorage = async () => {
        const storedRoles = await AsyncStorage.getItem('roles');
        const storedPermissions = await AsyncStorage.getItem('permissions');

        if (storedRoles) setRoles(JSON.parse(storedRoles));
        if (storedPermissions) setPermissions(JSON.parse(storedPermissions));
    };

    useEffect(() => {
        const fetchAccess = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await userAccessUpdate();
                const data = res;
                setRoles([...data.roles || []]);
                setPermissions([...data.permissions || []]);

                await AsyncStorage.setItem('roles', JSON.stringify(data.roles));
                await AsyncStorage.setItem('permissions', JSON.stringify(data.permissions));
            } catch (err) {
                console.warn('Access sync failed:', err);
            }
        };

        fetchAccess();
        const interval = setInterval(() => {
            fetchAccess();
            loadFromStorage();
        }, 5 * 1000);

        return () => clearInterval(interval);
    }, []);


    const can = (perm: string) => permissions.includes(perm);
    const hasRole = (role: string) => roles.includes(role);
    const hasAnyRole = (roleList: string[]) => roleList.some(r => roles.includes(r));

    return (
        <AccessContext.Provider value={{ roles, permissions, can, hasRole, hasAnyRole }}>
            {children}
        </AccessContext.Provider>
    );
};

export const useAccess = () => {
    const ctx = useContext(AccessContext);
    if (!ctx) throw new Error('useAccess must be used inside AccessProvider');
    return ctx;
};
