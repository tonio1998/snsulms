import React, { useState } from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	useColorScheme, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { useLoading } from '../../context/LoadingContext.tsx';
import { useAlert } from '../../components/CAlert.tsx';
import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import { CText } from '../../components/common/CText.tsx';
import { API_BASE_URL } from '../../../env.ts';
import { changePhoneNumber, forgotPassword, verifyPhoneNumber, verifyPhoneNumberForgot } from '../../api/VerificationApi.ts';
import CButton from '../../components/buttons/CButton.tsx';
import { handleApiError } from '../../utils/errorHandler.ts';

const ForgotPassword = ({ navigation }: any) => {
	const isDarkMode = useColorScheme() === 'light';
	const colors = theme.colors[isDarkMode ? 'dark' : 'light'];
	
	const { showLoading, hideLoading } = useLoading();
	const { showAlert } = useAlert();
	
	const [phone, setPhone] = useState('');
	const [loading, setLoading] = useState(false);
	const [code, setCode] = useState('');
	const [otpSent, setOtpSent] = useState(false);
	const [formatted, setFormatted] = useState('');
	
	const handleSendOTP = async () => {
		const parsed = parsePhoneNumberFromString(phone, 'PH');
		
		if (!parsed || !parsed.isValid()) {
			showAlert('error', 'Invalid Number', 'Please enter a valid Philippine phone number.');
			return;
		}
		
		const formattedPhone = parsed.format('E.164');
		setLoading(true);
		showLoading('Sending OTP...');
		
		try {
			setFormatted(formattedPhone)
			const dataSend = { phone: formattedPhone };
			const response = await forgotPassword(dataSend);
			const data = await response;
			
			if (response.success) {
				setOtpSent(true);
				showAlert('success', 'OTP Sent', 'An OTP has been sent to your number.');
			} else {
				showAlert('error', 'Failed', response.message || 'Failed to send OTP.');
			}
		} catch (error) {
			showAlert('error', 'Error', error?.response?.data?.message || 'Something went wrong while sending the OTP.');
			// handleApiError(error, 'Send OTP');
		} finally {
			hideLoading();
			setLoading(false);
		}
	};
	
	const confirmCode = async () => {
		if (!code.trim()) {
			Alert.alert('Missing Code', 'Please enter the OTP code.');
			return;
		}
		
		try {
			const dataSend = { phone: formatted, otp: code.trim(), type: 'forgot-password' };
			const response = await verifyPhoneNumberForgot(dataSend);
			// console.log(response.message);
			const data = await response;
			
			if (data.success) {
				showAlert('success', 'Success', 'Phone number verified! Your password has been reset. Your password is your OTP. You will change it later.');
				setTimeout(() => {
					navigation.goBack();
				}, 1000);
			} else {
				showAlert('error', 'Error', data.message || 'Verification failed.');
			}
		} catch (error) {
			console.error(error);
			handleApiError(error, 'Verify OTP');
		}
	};
	
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.light.primary }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 105}
			>
				<View style={globalStyles.bgTopCircle} />
				<View style={globalStyles.bgBottomCircle} />
				
				<TouchableOpacity onPress={() => navigation.replace('LoginOptions')} style={styles.back}>
					<Icon name="arrow-back" size={24} color="#fff" />
					<Text style={styles.backText}>Back</Text>
				</TouchableOpacity>
				
				<View style={{ padding: 24 }}>
					{!otpSent ? (
						<>
							<View style={styles.topSection}>
								<CText fontSize={25} fontStyle={'B'} style={[globalStyles.shadowText, { color: '#fff' }]}>
									Forgot Password
								</CText>
								<CText style={{ color: '#fff', marginTop: 4 }}>Enter your registered number</CText>
							</View>
							<Text>{'\n'}</Text>
							<CText fontSize={16} style={{ color: '#fff', marginBottom: 5 }}>
								Phone Number (eg. 09XX XXX XXXX)
							</CText>
							<TextInput
								placeholderTextColor="#888"
								value={phone}
								onChangeText={setPhone}
								style={[styles.input, { marginBottom: 20 }]}
								keyboardType="phone-pad"
								autoCapitalize="none"
							/>
							
							<TouchableOpacity
								style={[styles.button, globalStyles.shadowBtn]}
								onPress={handleSendOTP}
								activeOpacity={0.8}
								disabled={loading}
							>
								{loading ? (
									<ActivityIndicator color="#000" />
								) : (
									<CText fontSize={16} style={styles.buttonText}>
										Send OTP
									</CText>
								)}
							</TouchableOpacity>
						</>
					) : (
						<>
							<View style={styles.topSection}>
								<CText fontSize={25} fontStyle={'B'} style={[globalStyles.shadowText, { color: '#fff' }]}>
									One Time Password
								</CText>
								<CText style={{ color: '#fff', marginTop: 4 }}>Pls enter the OTP code sent to your registered number</CText>
							</View>
							<Text>{'\n'}</Text>
							<TextInput
								placeholder="Enter OTP"
								value={code}
								placeholderTextColor="#888"
								onChangeText={setCode}
								keyboardType="number-pad"
								style={[styles.input, {marginBottom: 20 }]}
							/>
							<TouchableOpacity
								style={[styles.button, globalStyles.shadowBtn]}
								onPress={confirmCode}
								activeOpacity={0.8}
								disabled={loading}
							>
								{loading ? (
									<ActivityIndicator color="#000" />
								) : (
									<CText fontSize={16} style={styles.buttonText}>
										Verify OTP
									</CText>
								)}
							</TouchableOpacity>
						</>
					)}
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	topSection: {
		alignItems: 'center',
	},
	back: {
		margin: 30,
		marginTop: 60,
		flexDirection: 'row',
		alignItems: 'center',
	},
	backText: {
		color: '#fff',
		marginLeft: 8,
		fontSize: 16,
		fontWeight: '500',
	},
	input: {
		height: 50,
		backgroundColor: '#F5F5F5',
		borderRadius: 10,
		paddingHorizontal: 16,
		fontSize: 16,
		color: '#000',
	},
	button: {
		backgroundColor: theme.colors.light.secondary,
		paddingVertical: 14,
		paddingHorizontal: 40,
		borderRadius: theme.radius.sm,
		width: '100%',
		alignItems: 'center',
	},
	buttonText: {
		color: '#000',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

export default ForgotPassword;
