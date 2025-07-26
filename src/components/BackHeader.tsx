import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../theme/styles.ts';

const BackHeader = ({ label = 'Back', icon = 'arrow-back' }) => {
	const navigation = useNavigation();

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={() => navigation.goBack()}
				style={styles.button}
			>
				<Icon name={icon} size={24} color="#000" style={styles.icon} />
				{/*<Text style={[globalStyles.text, styles.label]}>{label}</Text>*/}
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 50,
		left: 20,
		zIndex: 100,
		elevation: 10,
		backgroundColor: 'rgba(255,255,255,0.9)',
		padding: 8,
		borderRadius: 8,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	icon: {
		// marginRight: 8,
	},
	label: {
		marginTop: 2,
	},
});

export default BackHeader;
