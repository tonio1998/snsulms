import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../theme/styles.ts';
import {CText} from "./CText.tsx";

const BackHeader = ({ label = 'Back', icon = 'arrow-back', title }) => {
	const navigation = useNavigation();

	return (
		<View style={styles.headerWrapper}>
			<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
				<Icon name={icon} size={20} color="#333" />
			</TouchableOpacity>
			{title && (
				<View style={styles.titleContainer}>
					<CText fontStyle={'SB'} fontSize={18} style={{ color: '#000'}} numberOfLines={1}>
						{title}
					</CText>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	headerWrapper: {
		position: 'absolute',
		top: Platform.OS === 'ios' ? 60 : 40,
		left: 0,
		right: 0,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		zIndex: 100,
		// elevation: 10,
		// backgroundColor: 'rgba(255,255,255,0.9)',
		height: 60,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
		alignItems: 'center',
		justifyContent: 'center',
	},
	titleContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'none',
	},
});

export default BackHeader;
