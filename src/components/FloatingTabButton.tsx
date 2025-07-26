import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function FloatingTabButton({ children, onPress, style }) {
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={onPress}
			style={[styles.container, style]}
		>
			<View style={styles.button}>{children}</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: -30,
		alignSelf: 'center',
		elevation: 10,
	},
	button: {
		backgroundColor: theme.colors.light.primary,
		width: 60,
		height: 60,
		borderRadius: 40,
		padding: 14,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#fff',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
});
