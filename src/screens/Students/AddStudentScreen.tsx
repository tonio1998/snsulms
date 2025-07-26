import React, { useContext, useState } from 'react';
import {
	View,
	TextInput,
	TouchableOpacity,
	Text,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Alert,
	KeyboardAvoidingView,
	Platform
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import BackgroundWrapper from '../../utils/BackgroundWrapper';
import { globalStyles } from '../../theme/styles';
import { theme } from '../../theme';
import { addStudent } from '../../api/studentsApi';
import { CText } from '../../components/CText.tsx';
import { saveOfflineStudent } from '../../utils/sqlite/students';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import uuid from 'react-native-uuid';
import { handleApiError } from '../../utils/errorHandler.ts';
const AddStudentScreen = ({ navigation }) => {
	const network = useContext(NetworkContext);
	const [form, setForm] = useState({
		LRN: '',
		FirstName: '',
		MiddleName: '',
		LastName: '',
		PhoneNumber: '',
		Suffix: '',
		Section: '',
		YearLevel: ''
	});

	const [errors, setErrors] = useState({});

	const handleChange = (name, value) => {
		const formattedValue = name === 'PhoneNumber' ? value : value.toUpperCase();

		setForm(prev => ({ ...prev, [name]: formattedValue }));
		setErrors(prev => ({ ...prev, [name]: null }));
	};


	const handleSubmit = async () => {
		const newErrors = {};

		if (!form.LRN) newErrors.LRN = 'LRN is required.';
		if (!form.FirstName) newErrors.FirstName = 'First Name is required.';
		if (!form.LastName) newErrors.LastName = 'Last Name is required.';
		if (!form.Section) newErrors.Section = 'Section is required.';
		if (!form.YearLevel) newErrors.YearLevel = 'Year Level is required.';

		if (!form.PhoneNumber || form.PhoneNumber === '+63') {
			newErrors.PhoneNumber = 'Phone Number is required.';
		} else if (form.PhoneNumber.length !== 13) {
			newErrors.PhoneNumber = 'Phone Number must be exactly 10 digits after +63.';
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			return;
		}

		try {

			let studentData = {
				...form,
                id: uuid.v4(),
			};

			if (network?.isOnline) {
				const response = await addStudent(form);

				if (response?.data?.id) {
					setForm({
						LRN: '',
						FirstName: '',
						MiddleName: '',
						LastName: '',
						PhoneNumber: '+63',
						Suffix: '',
						Section: '',
						YearLevel: '',
					});
					setErrors({});
					navigation.navigate('StudentDetails', { student: response.data.id });
				}
			} else {
				await saveOfflineStudent(studentData);

				setForm({
					LRN: '',
					FirstName: '',
					MiddleName: '',
					LastName: '',
					PhoneNumber: '+63',
					Suffix: '',
					Section: '',
					YearLevel: '',
				});
				setErrors({});
				navigation.navigate('StudentDetails', { student: studentData.id, offline: true });
			}
		} catch (error) {
			newErrors.PhoneNumber = error?.response?.data?.message;
			for (const key in error?.response?.data?.errors) {
				newErrors.key = error?.response?.data?.errors[key][0];
			}
			setErrors(newErrors);
			// console.error("Submit error:", error);
		}
	};

	return (
		<>
			<CustomHeader />
			<BackgroundWrapper>
				<SafeAreaView style={globalStyles.safeArea}>
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : undefined}
						style={{ flex: 1 }}
					>
						<ScrollView contentContainerStyle={styles.formContainer}>
							<CText style={{ marginBottom: 20, textAlign: 'center' }} fontStyle={'SB'} fontSize={20}>Add Student</CText>

							{/* LRN */}
							<View style={{ marginBottom: 12 }}>
								<TextInput
									placeholder="LRN"
									placeholderTextColor={'#ccc'}
									value={form.LRN}
									onChangeText={text => handleChange('LRN', text)}
									style={[styles.input, errors.LRN && styles.errorInput]}
								/>
								{errors.LRN && <Text style={styles.errorText}>{errors.LRN}</Text>}
							</View>

							{/* First Name */}
							<View style={{ marginBottom: 12 }}>
								<TextInput
									placeholder="First Name"
									placeholderTextColor={'#ccc'}
									value={form.FirstName}
									onChangeText={text => handleChange('FirstName', text)}
									style={[styles.input, errors.FirstName && styles.errorInput]}
								/>
								{errors.FirstName && <Text style={styles.errorText}>{errors.FirstName}</Text>}
							</View>

							{/* Middle Name */}
							<View style={{ marginBottom: 12 }}>
								<TextInput
									placeholder="Middle Name"
									placeholderTextColor={'#ccc'}
									value={form.MiddleName}
									onChangeText={text => handleChange('MiddleName', text)}
									style={styles.input}
								/>
							</View>

							{/* Last Name + Suffix */}
							<View style={styles.row}>
								<View style={{ marginBottom: 12, width: '48%' }}>
									<TextInput
										placeholder="Last Name"
										placeholderTextColor={'#ccc'}
										value={form.LastName}
										onChangeText={text => handleChange('LastName', text)}
										style={[styles.input, errors.LastName && styles.errorInput]}
									/>
									{errors.LastName && <Text style={styles.errorText}>{errors.LastName}</Text>}
								</View>
								<View style={{ marginBottom: 12, width: '48%' }}>
									<TextInput
										placeholder="Suffix"
										placeholderTextColor={'#ccc'}
										value={form.Suffix}
										onChangeText={text => handleChange('Suffix', text)}
										style={styles.input}
									/>
								</View>
							</View>

							{/* Phone Number */}
							<View style={{ marginBottom: 12 }}>
								<TextInput
									placeholder="Phone Number"
									placeholderTextColor={'#ccc'}
									value={form.PhoneNumber}
									onChangeText={text => {
										text = text.replace(/[^0-9]/g, '');
										if (text.startsWith('0')) text = text.slice(1);
										else if (text.startsWith('63')) text = text.slice(2);
										const formatted = '+63' + text.slice(0, 10);
										if (formatted.length <= 13) {
											handleChange('PhoneNumber', formatted);
										}
									}}
									keyboardType="phone-pad"
									style={[styles.input, errors.PhoneNumber && styles.errorInput]}
								/>
								{errors.PhoneNumber && <Text style={styles.errorText}>{errors.PhoneNumber}</Text>}
							</View>

							{/* Year Level + Section */}
							<View style={styles.row}>
								<View style={{ marginBottom: 12, width: '48%' }}>
									<TextInput
										placeholder="Year Level"
										placeholderTextColor={'#ccc'}
										value={form.YearLevel}
										onChangeText={(text) => {
											const cleaned = text.replace(/[^0-9]/g, '');
											if (cleaned === '') {
												handleChange('YearLevel', '');
											} else {
												const number = parseInt(cleaned, 10);
												if (number >= 6 && number <= 12) {
													handleChange('YearLevel', cleaned);
												}
											}
										}}
										keyboardType="number-pad"
										style={[styles.input, errors.YearLevel && styles.errorInput]}
									/>
									{errors.YearLevel && <Text style={styles.errorText}>{errors.YearLevel}</Text>}
								</View>
								<View style={{ marginBottom: 12, width: '48%' }}>
									<TextInput
										placeholder="Section"
										placeholderTextColor={'#ccc'}
										value={form.Section}
										onChangeText={text => handleChange('Section', text)}
										style={[styles.input, errors.Section && styles.errorInput]}
									/>
									{errors.Section && <Text style={styles.errorText}>{errors.Section}</Text>}
								</View>
							</View>

							<TouchableOpacity style={styles.button} onPress={handleSubmit}>
								<Text style={styles.buttonText}>Submit</Text>
							</TouchableOpacity>
						</ScrollView>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	formContainer: {
		padding: 16
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 8
	},
	errorInput: {
		borderColor: 'red'
	},
	errorText: {
		color: 'red',
		fontSize: 12,
		marginTop: 4,
		marginLeft: 4
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	halfInput: {
		width: '48%'
	},
	thirdInput: {
		width: '32%'
	},
	button: {
		backgroundColor: theme.colors.light.primary,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold'
	}
});

export default AddStudentScreen;
