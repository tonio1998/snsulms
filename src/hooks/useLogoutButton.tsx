// ✅ This is now a normal component (not a hook)
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext.tsx';

export const useLogoutButton = () => {
	const navigation = useNavigation();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		Alert.alert('Logout', 'Are you sure you want to log out?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Logout',
				style: 'destructive',
				onPress: () => {
					try {
						logout();
					} catch (error) {
						console.error('Logout failed:', error);
					}
				},
			},
		]);
	};

	return (
		<TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
			<Icon name="log-out-outline" size={22} color="#fff" />
		</TouchableOpacity>
	);
};
