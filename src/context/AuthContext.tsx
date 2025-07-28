import React, { createContext, useState, useEffect, useContext, useMemo, useRef } from 'react';
import { Alert, Platform, ToastAndroid } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { setAuthToken } from '../api/api.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import checkBiometricSupport from '../services/checkBiometricSupport.ts';

interface AuthContextType {
	user: { id: string; email: string } | null;
	loginAuth: (userData: { user: any; token: string }) => Promise<void>;
	logout: () => Promise<void>;
	updateUser: (updatedFields: Partial<{ id: string; email: string }>) => Promise<void>;
	isAuthLoading: boolean;
	isBiometricSupported: boolean;
	biometricEnabled: boolean;
	enableBiometricLogin: () => Promise<boolean>;
	disableBiometricLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<{ id: string; email: string } | null>(null);
	const [roles, setRoles] = useState([]);
	const [permissions, setPermissions] = useState([]);
	const [isAuthLoading, setIsAuthLoading] = useState(true);
	
	const [isBiometricSupported, setIsBiometricSupported] = useState(false);
	const [biometricEnabled, setBiometricEnabled] = useState(false);
	const biometricEnabledRef = useRef(false);

	useEffect(() => {
		if (!user?.email) return;
		let isMounted = true;

		const init = async () => {
			try {
				const bioType = await Keychain.getSupportedBiometryType();
				if (isMounted) setIsBiometricSupported(!!bioType);

				const result = await checkBiometricSupport();
				const biometricEmail = await AsyncStorage.getItem('biometricUserEmail');

				if (biometricEmail !== user.email) {
					setBiometricEnabled(false);
					biometricEnabledRef.current = false;
					return;
				}

				const flagKey = `biometricEnabled:${user.email}`;
				const flag = await AsyncStorage.getItem(flagKey);

				const isSupported = result.supported;
				const isEnabled = flag === 'true';

				if (isSupported && isEnabled) {
					setBiometricEnabled(true);
					biometricEnabledRef.current = true;
				} else {
					setBiometricEnabled(false);
					biometricEnabledRef.current = false;
				}
			} catch (err) {
				console.error('Biometric init error:', err);
			} finally {
				if (isMounted) setIsAuthLoading(false);
			}
		};

		init();

		return () => {
			isMounted = false;
		};
	}, [user?.email]);




	const loginAuth = async (userData: { user: any; token: string }) => {
		try {
			await AsyncStorage.setItem('roles', JSON.stringify(userData.roles));
			await AsyncStorage.setItem('permissions', JSON.stringify(userData.permissions));
			setRoles(userData.roles)
			setPermissions(userData.permissions)
			await Keychain.setGenericPassword(JSON.stringify(userData.user), userData.token);
			setUser(userData.user);
			await setAuthToken(userData.token);
		} catch (err) {
			// console.error('Login error:', err);
		}
	};
	
	const logout = async () => {
		try {
			setUser(null);
			await setAuthToken(null);
			await AsyncStorage.removeItem('roles');
			await AsyncStorage.removeItem('permissions');
			await AsyncStorage.removeItem('isLoggedIn');
			// await Keychain.resetGenericPassword();
			// await Keychain.resetGenericPassword({ service: 'fgHEMIS-biometric' });
			// setBiometricEnabled(false);
		} catch (err) {
			// console.error('Logout error:', err);
		}
	};
	
	const updateUser = async (updatedFields: Partial<typeof user>) => {
		if (!user) return;
		const updatedUser = { ...user, ...updatedFields };
		setUser(updatedUser);
		const creds = await Keychain.getGenericPassword();
		if (creds) {
			await Keychain.setGenericPassword(JSON.stringify(updatedUser), creds.password);
		}
	};
	
	const enableBiometricLogin = async (): Promise<boolean> => {
		const existingUser = await AsyncStorage.getItem('biometricUserEmail');

		if (existingUser && existingUser !== user?.email) {
			Alert.alert(
				'Biometric already in use',
				`Biometric login is already enabled for ${existingUser}. Disable it first to enable for this account.`
			);
			return false;
		}


		try {
			if (!user) {
				ToastAndroid.show('User not found. Please login first.', ToastAndroid.SHORT);
			return false;
			}

			const storedToken = await AsyncStorage.getItem('mobile');
			if (!storedToken) {
			Alert.alert('Token not found.');
			return false;
			}

			const secureData = {
			user,
			token: storedToken,
				roles: roles,
				permissions: permissions
			};

			const serviceKey = `tnhs-biometric-${user.email}`;
			const flagKey = `biometricEnabled:${user.email}`;

			await Keychain.setGenericPassword(
			JSON.stringify(secureData),
			storedToken,
			{
				service: serviceKey,
				accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
				accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
				authenticationPrompt: {
				title: 'Confirm fingerprint to enable biometric login',
				},
			}
			);

			await AsyncStorage.setItem(flagKey, 'true');
			await AsyncStorage.setItem('biometricUserEmail', user.email);

			setBiometricEnabled(true);
			biometricEnabledRef.current = true;
			ToastAndroid.show('Biometric login has been enabled', ToastAndroid.SHORT);

			return true;
		} catch (err) {
			console.error('Error enabling biometric login:', err);
			return false;
		}
	};


	const disableBiometricLogin = async () => {
		try {
			if (!user?.email) {
				console.warn('No user found for disabling biometric.');
				return;
			}

			const serviceKey = `tnhs-biometric-${user.email}`;
			const flagKey = `biometricEnabled:${user.email}`;
			const currentBiometricUser = await AsyncStorage.getItem('biometricUserEmail');

			// Only remove global biometric user if this user is the one currently set
			if (currentBiometricUser === user.email) {
				await AsyncStorage.removeItem('biometricUserEmail');
			}

			await AsyncStorage.removeItem(flagKey);
			await Keychain.resetGenericPassword({ service: serviceKey });

			setBiometricEnabled(false);
			biometricEnabledRef.current = false;
			ToastAndroid.show('Biometric login disabled', ToastAndroid.SHORT);
		} catch (err) {
			console.error('Error disabling biometric login:', err);
		}
	};



	const value = useMemo(() => ({
		user,
		isAuthLoading,
		loginAuth,
		logout,
		updateUser,
		isBiometricSupported,
		biometricEnabled: biometricEnabledRef.current,
		enableBiometricLogin,
		disableBiometricLogin,
	}), [user, isAuthLoading, isBiometricSupported, biometricEnabled]);
	
	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used inside AuthProvider');
	return context;
};
