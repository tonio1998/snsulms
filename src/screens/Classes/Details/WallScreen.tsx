import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	SafeAreaView,
	TouchableOpacity, Alert, ToastAndroid
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader.tsx';
import { FILE_BASE_URL } from '../../../api/api_configuration.ts';
import { CText } from '../../../components/CText.tsx';
import { getStudentDetails } from '../../api/studentsApi.ts';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { globalStyles } from '../../../theme/styles.ts';
import BackgroundWrapper from '../../../utils/BackgroundWrapper';
import { theme } from '../../../theme';
import { useLoading } from '../../../context/LoadingContext.tsx';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { navigate } from '../../../utils/navigation.ts';
import CButton from '../../../components/CButton.tsx';
import { resetUserPassword } from '../../../api/modules/userApi.ts';
import { useAlert } from '../../../components/CAlert.tsx';
import Toast from 'react-native-toast-message';
import hide = Toast.hide;
import BackHeader from '../../../components/BackHeader.tsx';
import { useAccess } from '../../../hooks/useAccess.ts';
import { getOfflineStudentById } from '../../../utils/sqlite/students';
import NetInfo from '@react-native-community/netinfo';
import { NetworkContext } from '../../../context/NetworkContext.tsx';
const ClassDetailsScreen = ({ route, navigation }) => {
	const network = useContext(NetworkContext);
	const studentId = route.params.student;
	console.log("studentId from StudentDetailsScreen", studentId)
	const { hasRole, can } = useAccess();
	const [student, setStudent] = useState(null);
	const [loading, setLoading] = useState(true);
	const { showAlert } = useAlert();
	const [error, setError] = useState(null);
	const { showLoading, hideLoading } = useLoading();
	const scanningActive = useRef(false);
	const lastScanTimeRef = useRef(Date.now());
	const animationRef = useRef(null);
	const isFocused = useIsFocused();
	const CurrentUserID = useRef(studentId);


	const fetchStudentData = async () => {
		showLoading("Please wait...");
		try {
			let studentData;
			if (network?.isOnline) {
				const response = await getStudentDetails(studentId);
				studentData = response;
				setStudent(studentData);
			} else {
				studentData = await getOfflineStudentById(studentId);
				setStudent(studentData);

				if (!studentData) {
				}
			}
		} catch (err) {
			handleApiError(err, "Failed to load student details.");
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useEffect(() => {
		fetchStudentData();
	}, [studentId]);


	useFocusEffect(
		useCallback(() => {
			fetchStudentData();
			scanningActive.current = false;
		}, [studentId])
	);


	const startScanLoop = async () => {
		if (scanningActive.current) return;
		scanningActive.current = true;

		try {
			await fetchStudentData();

			const onTagDiscovered = async tag => {
				const now = Date.now();
				const elapsed = now - lastScanTimeRef.current;
				if (elapsed < 1000) return;

				lastScanTimeRef.current = now;
				const tagId = tag?.id;

				if (tagId) {
					await NfcManager.unregisterTagEvent();
					NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
					scanningActive.current = false;

					navigate('NFCRegister', {
						params: {
							student: CurrentUserID.current,
							tagId: tagId
						},
					});

					animationRef.current?.play?.();
				}
			};

			NfcManager.setEventListener(NfcEvents.DiscoverTag, onTagDiscovered);

			await NfcManager.start();
			await NfcManager.registerTagEvent();
		} catch (err) {
			Alert.alert('Scan Error', err.message || 'Unexpected error');
			handleApiError(err, "sd");
			scanningActive.current = false;
		}
	};


	const handleConnectNFC = async () => {
		const supported = await NfcManager.isSupported();
		if (!supported) {
			showAlert('warning', 'NFC Not Supported', 'This device does not support NFC')
			return;
		}

		await startScanLoop();
		ToastAndroid.show('Please tap NFC card near the device.', ToastAndroid.LONG);
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#000" />
			</View>
		);
	}

	if (error || !student) {
		return (
			<View style={styles.centered}>
				<Text>{error || 'No student data available.'}</Text>
			</View>
		);
	}

	const handleResetPass = () => {
		doResetPassword();
	};

	const doResetPassword = () => {
		Alert.alert(
			'Reset Password',
			'Are you sure you want to reset the password?',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Yes, Reset',
					style: 'destructive',
					onPress: async () => {
						showLoading('Resetting Password...')
						try {
							const response = await resetUserPassword(
								studentId,
								student?.student_user?.id || 0,
								'students'
							);

							showAlert(
								'success',
								'Password Reset',
								`${response.username}\n${response.password}`
							);
							navigation.goBack();
						} catch (error) {
							console.error('Password reset error:', error);
							handleApiError(error, 'ds');
						} finally {
							hideLoading();
						}
					},
				},
			]
		);
	};

	return (
		<>
			<BackHeader />
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 40}]}>
					<ScrollView contentContainerStyle={styles.container}>
						<View style={[globalStyles.cardRow, {marginBottom: 10}]}>
							{((hasRole('admin') || can('resetpassword')) && network?.isOnline ) && (
								<CButton
									title={'Reset Password'}
									type={'success_soft'}
									icon={'key'}
									textStyle={{
										color: theme.colors.light.primary
									}}
									onPress={handleResetPass} />
							)}
						</View>
					</ScrollView>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		alignItems: 'center',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatar: {
		width: 150,
		height: 150,
		borderWidth: 1,
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
	},
});

export default ClassDetailsScreen;
