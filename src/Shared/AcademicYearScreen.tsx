import React, { useEffect, useState } from 'react';
import {View, TouchableOpacity, StyleSheet, SafeAreaView, Alert, StatusBar} from 'react-native';
import { CText } from '../components/common/CText.tsx';
import { globalStyles } from '../theme/styles.ts';
import BackgroundWrapper from '../utils/BackgroundWrapper';
import { theme } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AcademicYearScreen({ navigation }) {
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState(`${currentYear}-${currentYear + 1}`);
	const [selectedSem, setSelectedSem] = useState('1');

	const years = Array.from({ length: 5 }, (_, i) => {
		const year = currentYear - 4 + i;
		return `${year}-${year + 1}`;
	}).reverse();

	const semesters = [
		{ value: '1', label: '1st Sem' },
		{ value: '2', label: '2nd Sem' },
		{ value: '3', label: 'Summer 1' },
		{ value: '4', label: 'Summer 2' },
	];

	useEffect(() => {
		(async () => {
			try {
				const from = await AsyncStorage.getItem('AYFrom');
				const to = await AsyncStorage.getItem('AYTo');
				const sem = await AsyncStorage.getItem('Semester');

				if (from && to) setSelectedYear(`${from}-${to}`);
				if (sem) setSelectedSem(sem);
			} catch (error) {
				console.error('Error loading academic year:', error);
			}
		})();
	}, []);

	const handleSave = async () => {
		try {
			const [from, to] = selectedYear.split('-');
			await AsyncStorage.setItem('AYFrom', from);
			await AsyncStorage.setItem('AYTo', to);
			await AsyncStorage.setItem('Semester', selectedSem);
			navigation.goBack();
		} catch (error) {
			console.error('Failed to save academic year:', error);
			Alert.alert('Error', 'Saving failed.');
		}
	};

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 100 }]}>
				<View style={styles.container}>
					<CText fontSize={20} fontStyle="B" style={{ marginBottom: 10 }}>
						Change Academic
					</CText>

					<CText fontSize={16} fontStyle="SB" style={{ color: '#000', marginTop: 20 }}>
						Academic Year
					</CText>

					<View style={styles.buttonGroup}>
						{years.map((year) => (
							<TouchableOpacity
								key={year}
								style={[styles.button, selectedYear === year && styles.selectedButton]}
								onPress={() => setSelectedYear(year)}
							>
								<CText
									fontSize={14}
									fontStyle="M"
									style={selectedYear === year ? styles.selectedText : styles.buttonText}
								>
									{year}
								</CText>
							</TouchableOpacity>
						))}
					</View>

					<CText fontSize={16} fontStyle="SB" style={{ color: '#000', marginTop: 20 }}>
						Semester
					</CText>

					<View style={[styles.buttonGroup, { marginTop: 2 }]}>
						{semesters.map((sem) => (
							<TouchableOpacity
								key={sem.value}
								style={[styles.button, selectedSem === sem.value && styles.selectedButton]}
								onPress={() => setSelectedSem(sem.value)}
							>
								<CText
									fontSize={14}
									fontStyle="M"
									style={selectedSem === sem.value ? styles.selectedText : styles.buttonText}
								>
									{sem.label}
								</CText>
							</TouchableOpacity>
						))}
					</View>

					<TouchableOpacity onPress={handleSave} style={styles.saveButton}>
						<CText fontSize={16} fontStyle="B" style={styles.saveButtonText}>
							Save
						</CText>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		paddingHorizontal: 16,
		width: '100%',
	},
	buttonGroup: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	button: {
		backgroundColor: '#ccc',
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 14,
		margin: 6, // replaced gap with margin for spacing
	},
	selectedButton: {
		backgroundColor: theme.colors.light.primary,
	},
	buttonText: {
		color: '#fff',
	},
	selectedText: {
		color: '#fff',
	},
	saveButton: {
		backgroundColor: theme.colors.light.primary,
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 30,
		marginTop: 30,
		position: 'absolute',
		bottom: 20,
		left: 20,
		right: 20,
	},
	saveButtonText: {
		color: '#fff',
		textAlign: 'center',
	},
});
