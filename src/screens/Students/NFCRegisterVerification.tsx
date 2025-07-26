import React, { useContext, useEffect, useState } from 'react';
import {
	View,
	Image,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	TouchableOpacity,
	Alert,
	Text, ToastAndroid
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { FILE_BASE_URL } from '../../api/api_configuration.ts';
import { CText } from '../../components/CText';
import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import CButton from '../../components/CButton.tsx';
import { saveUserNfcCode } from '../../api/modules/userApi.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { getStudentDetails } from '../../api/studentsApi.ts';
import { getOfflineStudentById } from '../../utils/sqlite/students';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import { useLoading } from '../../context/LoadingContext.tsx';

const NFCRegisterVerification = ({ route, navigation }) => {
	const studentId = route.params.params.student;
	console.log("studentId from NFCRegisterVerification", route.params)
	const tagId = route.params.params.tagId;
	const [saving, setSaving] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const [error, setError] = useState(null);
	const [student, setStudent] = useState(null);
	const network = useContext(NetworkContext);
	const [loading, setLoading] = useState(true);

	const fetchStudentData = async () => {
		showLoading("Please wait...");
		try {
			let studentData;
			if (network?.isOnline) {
				const response = await getStudentDetails(studentId);
				console.log("student confirm", response)
				studentData = response;
				setStudent(studentData);
			} else {
				studentData = await getOfflineStudentById(studentId);
				setStudent(studentData);

				if (!studentData) {
					setError("No offline data found for this student.");
				}
			}
		} catch (err) {
			handleApiError(err, "Failed to load student details.");
			setError('Something went wrong.');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useEffect(() => {
		fetchStudentData();
	}, [studentId]);

	const handleSave = async () => {
		if (!tagId) return;

		const existingCode = student?.student_user?.nfc_code;

		if (existingCode) {
			Alert.alert(
				'NFC Tag Exists',
				`This user already has an NFC tag assigned:\n\n${existingCode}\n\nDo you want to replace it with the new tag?`,
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Replace', style: 'destructive', onPress: () => doSave() }
				]
			);
		} else {
			doSave();
		}
	};

	const doSave = async () => {
		setSaving(true);
		try {
			await saveUserNfcCode(student.student_user.id, tagId);
			ToastAndroid.show('NFC tag assigned successfully!', ToastAndroid.SHORT);

			navigation.setParams({ tagId: undefined, student: undefined });
			navigation.goBack();
		} catch (error) {
			if (
				error.response &&
				error.response.status === 422 &&
				error.response.data.errors?.tag_id
			) {
				ToastAndroid.show('NFC Tag already assigned to another user.', ToastAndroid.SHORT);
			} else {
				ToastAndroid.show('Failed to save NFC tag.', ToastAndroid.SHORT);
			}
		} finally {
			setSaving(false);
		}
	};



	return (
		<SafeAreaView style={[globalStyles.flex1, styles.container]}>
			<ScrollView>
				<View style={styles.centered}>
					<Image
						source={
							student?.filepath
								? { uri: FILE_BASE_URL + student?.filepath }
								: require('../../../assets/img/ic_launcher.png')
						}
						style={styles.avatar}
					/>

					<View style={styles.infoBox}>
						<CText fontStyle="B" fontSize={20} style={{ marginBottom: 10 }}>
							{student?.FirstName} {student?.MiddleName} {student?.LastName} {student?.Suffix || ''}
						</CText>

						<Text style={styles.label}>LRN: {student?.LRN}</Text>
						<Text style={styles.label}>Year Level: {student?.YearLevel}</Text>
						<Text style={styles.label}>Section: {student?.Section}</Text>
					</View>

					<CText>{'\n'}</CText>
					<CText fontSize={15}>Tag ID</CText>
					<CText fontSize={30} fontStyle={'SB'}>{tagId}</CText>
				</View>
			</ScrollView>
			<View>
				<CButton
					title={saving ? 'Saving...' : 'Confirm'}
					type={'success'}
					icon={'save'}
					onPress={handleSave}
					textStyle={{
						color: theme.colors.light.primary
					}}
					style={{
						padding: 15,
						paddingHorizontal: 20,
						backgroundColor: '#fff',
						margin: 20,
						marginBottom: 20
				}}
				/>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		// padding: 20,
		backgroundColor: theme.colors.light.primary
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: theme.colors.light.card,
		padding: 15,
		borderRadius: 10,
		margin: 20
	},
	avatar: {
		width: 150,
		height: 150,
		borderRadius: 100,
		backgroundColor: theme.colors.light.primary + '55',
		marginBottom: 20,
	},
	infoBox: {
		width: '100%',
		backgroundColor: theme.colors.light.primary + '11',
		padding: 16,
		borderRadius: 10,
	},
	label: {
		fontSize: 16,
		marginBottom: 8,
		color: '#555',
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 30,
		width: '100%',
	},
	button: {
		flex: 1,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginHorizontal: 5,
	},
});

export default NFCRegisterVerification;
