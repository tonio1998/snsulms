import React, { useEffect, useState } from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	useColorScheme,
	Image,
	Platform,
	KeyboardAvoidingView,
	SafeAreaView, Alert, ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../../context/AuthContext.tsx';
import { useLoading } from '../../context/LoadingContext.tsx';
import { useAlert } from '../../components/CAlert.tsx';
import { loginWithBiometric } from '../../hooks/useBiometrics.ts';
import checkBiometricSupport from '../../services/checkBiometricSupport.ts';
import { authLogin, loginWithGoogle } from '../../api/modules/auth.ts';

import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import { CText } from '../../components/common/CText.tsx';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_BASE_URL, GOOGLE_CLIENT_ID } from '../../../env.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as Keychain from 'react-native-keychain';
import auth from '@react-native-firebase/auth';
import NetInfo from '@react-native-community/netinfo';

GoogleSignin.configure({
	webClientId: GOOGLE_CLIENT_ID,
	offlineAccess: true,
});
const SigninForm = ({ navigation }: any) => {
	const isDarkMode = useColorScheme() === 'light';
	const colors = theme.colors[isDarkMode ? 'dark' : 'light'];

	const { showAlert } = useAlert();
	const { showLoading, hideLoading } = useLoading();
	const { loginAuth } = useAuth();
	
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

	useEffect(() => {
		const checkSession = async () => {
			try {
				const netInfo = await NetInfo.fetch();
				const isConnected = netInfo.isConnected;

				const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
				const cachedSession = await Keychain.getGenericPassword();

				if (isLoggedIn === 'true' && cachedSession) {
					const sessionData = JSON.parse(cachedSession.password);

					if (!isConnected) {
						console.log('[OFFLINE] Logging in using cache...');
						await loginAuth(sessionData);
						// navigation.replace('Home');
					} else {
						console.log('[ONLINE] Optionally validate token or fetch latest data');
						// Optional: validate sessionData.token with API here
						await loginAuth(sessionData);
						navigation.replace('Home');
					}
				}
			} catch (err) {
				console.log('Offline login failed:', err);
			}
		};

		checkSession();
	}, []);


	const handleLogin = async () => {
		showLoading('Signing in...');
		try {
			const response = await authLogin({ email, password });
			if (response.status === 200) {
				const sessionData = response.data;
				await loginAuth(sessionData);
				await AsyncStorage.setItem('isLoggedIn', 'true');
				await AsyncStorage.setItem('mobile', sessionData.token);
				await Keychain.setGenericPassword('session', JSON.stringify(sessionData));
			}
		} catch (error) {
			showAlert('error', 'Login Failed', error.response?.data?.message || 'Something went wrong');
			handleApiError(error, 'Login');
		} finally {
			hideLoading();
		}
	};

	const handleBiometricLogin = async () => {
		try {
			const session = await loginWithBiometric(); // Face/Touch ID unlock
			const storedSession = await Keychain.getGenericPassword();

			if (storedSession) {
				const parsed = JSON.parse(storedSession.password);
				await loginAuth(parsed);
				await AsyncStorage.setItem('isLoggedIn', 'true');
				await AsyncStorage.setItem('mobile', parsed.token);
			} else {
				throw new Error('No cached session found');
			}
		} catch (err) {
			showAlert('error', 'Biometric Error', err.message || 'Could not login');
		}
	};


	const handleGoogleLogin = async () => {
		console.log("Login with Google");

		try {
			await GoogleSignin.hasPlayServices();
			await GoogleSignin.signOut();

			const userInfo = await GoogleSignin.signIn();
			showLoading('Logging in...');

			const user = userInfo?.user;
			const idToken = userInfo?.idToken;

			const response = await loginWithGoogle({
				token: idToken,
				name: user?.name,
				email: user?.email,
				photo: user?.photo,
			});

			const sessionData = response.data;
			await Keychain.setGenericPassword('session', JSON.stringify(sessionData));
			await AsyncStorage.setItem('isLoggedIn', 'true');
			await AsyncStorage.setItem('mobile', sessionData.token);

			await loginAuth(sessionData);
		} catch (error) {
			console.error('Google login error:', error?.response?.data || error?.message);
			handleApiError(error, 'Login');
			showAlert('error', 'Google Login Failed', error.message || 'Try again later');
		} finally {
			hideLoading();
		}
	};


	const setEmailOrPhone = (text: string) => {
		const input = text.trim();
		
		const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input);
		
		if (isEmail) {
			setEmail(input);
		} else {
			const phoneNumber = parsePhoneNumberFromString(input, 'PH');
			
			if (phoneNumber && phoneNumber.isValid()) {
				setEmail(phoneNumber.format('E.164'));
			} else {
				setEmail(input);
			}
		}
	};
	
	
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.light.card }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 105}
			>
				<ImageBackground
					source={require('../../../assets/img/main_bg.jpg')}
					style={styles.container}
					resizeMode="cover"
				>
			<TouchableOpacity
				onPress={() => navigation.replace('LoginOptions')}
				style={styles.back}
			>
				<Icon name="arrow-back" size={24} color="#000" />
				<Text style={[styles.backText, {fontWeight: 800}]}>Back</Text>
			</TouchableOpacity>

			<View style={styles.topSection}>
				<CText fontSize={38} fontStyle={'B'} style={[{ color: theme.colors.light.primary, marginBottom: 0 }]}>Sign In</CText>
				<CText style={{ color: '#000', marginBottom: 10 }}>Sign in to continue</CText>
			</View>
			<View style={{ padding: 24 }}>
				<View>
					<CText fontSize={16} style={{ color: '#000', marginBottom: 5, fontWeight: 600}}>Email / Phone Number</CText>
					<TextInput
						placeholderTextColor="#888"
						value={email}
						onChangeText={setEmailOrPhone}
						style={[styles.input, { marginBottom: 20 }]}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
					<CText fontSize={16} style={{ color: '#000', marginBottom: 5, fontWeight: 600}}>Password</CText>
					<TextInput
						placeholderTextColor="#888"
						autoCapitalize="none"
						autoCorrect={false}
						value={password}
						onChangeText={setPassword}
						style={[styles.input, { marginBottom: 20, color: '#000' }]}
						secureTextEntry
					/>
					<TouchableOpacity
						style={[styles.button, globalStyles.shadowBtn]}
						onPress={handleLogin}
						activeOpacity={0.8}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color={theme.colors.light.primary} />
						) : (
							<CText
								fontSize={16}
								style={[styles.buttonText]}
							>
								Sign In
							</CText>
						)}
					</TouchableOpacity>

					<View style={[globalStyles.mt_2, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}]}>
						<View />
						<TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
							<CText fontSize={14} style={{ marginLeft: 10, color: '#000',  fontWeight: 'bold' }}>Forgot Password?</CText>
						</TouchableOpacity>
					</View>

						<View style={styles.dividerContainer}>
							<View style={styles.divider} />
							<Text style={styles.dividerText}>or with</Text>
							<View style={styles.divider} />
						</View>

					<View style={styles.socialButtons}>
						<TouchableOpacity onPress={handleGoogleLogin} style={[globalStyles.socialButton, { boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }]}>
							<Icon name="logo-google" size={24} color="#DB4437" />
							<CText style={{ color: '#DB4437', fontSize: 12, fontWeight: 'bold', marginTop: 5 }}>Google</CText>
						</TouchableOpacity>
						{isBiometricEnabled && (
							<TouchableOpacity
								onPress={handleBiometricLogin}
								style={[globalStyles.socialButton, { backgroundColor: '#fff' }]}
							>
								<Icon name="finger-print" size={36} color={theme.colors.light.primary} />
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>
				</ImageBackground>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	topSection: {
		alignItems: 'center',
		marginTop: 50,
	},
	container: {
		flex: 1,
	},
	back: {
		margin: 30,
		marginTop: 60,
		flexDirection: 'row',
		alignItems: 'center',
		elevation: 15,
		shadowColor: theme.colors.light.primary,
		padding: 10,
		width: 100,
		backgroundColor: '#fff',
		borderRadius: 8
	},
	backText: {
		color: '#000',
		marginLeft: 8,
		fontSize: 16,
		fontWeight: '500',
	},
	card: {
		flex: 1,
		backgroundColor: '#fff',
		marginTop: 30,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		padding: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 6,
		color: '#222',
	},
	subtitle: {
		fontSize: 14,
		color: '#666',
		marginBottom: 24,
	},
	input: {
		height: 50,
		backgroundColor: '#F5F5F5',
		borderRadius: 10,
		paddingHorizontal: 16,
		fontSize: 16,
		marginBottom: 14,
	},
	button: {
		backgroundColor: theme.colors.light.primary,
		paddingVertical: 14,
		paddingHorizontal: 40,
		borderRadius: theme.radius.sm,
		marginBottom: 20,
		width: '100%',
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontWeight: 800,
		fontSize: 16,
	},
	fingerprint: {
		marginTop: 25,
		alignItems: 'center',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#ddd',
		padding: 10,
		width: 100,
		alignSelf: 'center',
		borderColor: '#fff',
	},
	dividerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 30,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: '#ddd',
	},
	dividerText: {
		marginHorizontal: 10,
		color: '#aaa',
		fontSize: 13,
	},
	socialButtons: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 20,
	},
	socialBtn: {
		width: 60,
		height: 60,
		borderRadius: 26,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
	},
});

export default SigninForm;
