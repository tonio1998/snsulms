import React, { useContext, useEffect, useState } from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	useColorScheme,
	KeyboardAvoidingView,
	SafeAreaView,
	ImageBackground,
	Platform,
	Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../../context/AuthContext.tsx';
import { useLoading } from '../../context/LoadingContext.tsx';
import { loginWithBiometric } from '../../hooks/useBiometrics.ts';
import { authLogin, loginWithGoogle } from '../../api/modules/auth.ts';
import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import { CText } from '../../components/common/CText.tsx';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {APP_NAME, GOOGLE_CLIENT_ID} from '../../../env.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as Keychain from 'react-native-keychain';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import bcrypt from 'bcryptjs';
import checkBiometricSupport from '../../services/checkBiometricSupport.ts';
import BackHeader from '../../components/layout/BackHeader.tsx';
import {useAlert} from "../../components/CAlert.tsx";

GoogleSignin.configure({
	webClientId: GOOGLE_CLIENT_ID,
	offlineAccess: true,
	scopes: ['https://www.googleapis.com/auth/calendar'],
});

const SigninForm = ({ navigation }: any) => {
	const { isOnline } = useContext(NetworkContext);
	const isDarkMode = useColorScheme() === 'dark';
	const colors = theme.colors[isDarkMode ? 'dark' : 'light'];

	const { showLoading, hideLoading } = useLoading();
	const { loginAuth } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const { showAlert } = useAlert();
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		(async () => {
			await initBiometric();
		})();
	}, []);

	const initBiometric = async () => {
		const storedEmail = await AsyncStorage.getItem('biometricUserEmail');
		const result = await checkBiometricSupport();
		const flagKey = `biometricEnabled:${storedEmail}`;
		const flag = await AsyncStorage.getItem(flagKey);
		setIsBiometricEnabled(result.supported && flag === 'true');
	};

	const checkSession = async () => {
		try {
			const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
			const cachedSession = await Keychain.getGenericPassword();
			if (isLoggedIn && cachedSession) {
				const user = JSON.parse(cachedSession.username);
				const token = await AsyncStorage.getItem('mobile');
				await loginAuth({
					user,
					token,
					roles: user.roles,
					permissions: user.permissions,
				});
			}
		} catch {}
	};

	const handleLogin = async () => {
		showLoading('Signing in...');
		setEmailError('');
		setPasswordError('');
		try {
			if (isOnline) {
				try {
					const response = await authLogin({ email, password });
					const sessionData = { ...response.data, password };
					await loginAuth(response.data);
					await AsyncStorage.setItem('isLoggedIn', 'true');
					await AsyncStorage.setItem('mobile', sessionData.token);
					await Keychain.setGenericPassword(JSON.stringify(sessionData), sessionData.token);
				} catch (err) {
					setEmailError('Incorrect credentials.');
					handleApiError(err, 'Login');
				}
			} else {
				const cachedSession = await Keychain.getGenericPassword();
				if (cachedSession) {
					const sessionData = JSON.parse(cachedSession.username);
					const isMatch = await bcrypt.compare(password, sessionData.password);
					if (sessionData.email === email && isMatch) {
						await loginAuth({
							user: sessionData,
							token: cachedSession.password,
							roles: sessionData.roles,
							permissions: sessionData.permissions,
						});
						await AsyncStorage.setItem('isLoggedIn', 'true');
						await AsyncStorage.setItem('mobile', cachedSession.password);
					} else {
						setEmailError('Incorrect credentials.');
					}
				} else {
					setEmailError('No cached session available.');
				}
			}
		} catch (err) {
			setEmailError('Login failed. Please try again.');
			handleApiError(err, 'Login');
		} finally {
			hideLoading();
		}
	};

	const handleBiometricLogin = async () => {
		try {
			const session = await loginWithBiometric();
			if (session) {
				await loginAuth(session);
				await AsyncStorage.setItem('isLoggedIn', 'true');
				await AsyncStorage.setItem('mobile', session.token);
			}
		} catch (err) {
			handleApiError(err, 'Biometric');
		}
	};

	const handleGoogleLogin = async () => {
		try {
			await GoogleSignin.hasPlayServices();
			await GoogleSignin.signOut();
			const userInfo = await GoogleSignin.signIn();
			const tokens = await GoogleSignin.getTokens();
			const accessToken = tokens.accessToken;
			const user = userInfo?.data?.user;
			const idToken = userInfo?.data?.idToken;

			showLoading('Logging in...');
			await AsyncStorage.setItem(`googleAccessToken${user?.email}`, accessToken);

			const response = await loginWithGoogle({
				token: idToken,
				name: user?.name,
				email: user?.email,
				photo: user?.photo,
			});

			console.log("response", response);

			await loginAuth(response.data);
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Something went wrong during Google login.';
			showAlert('error', 'Error', message);
			handleApiError(error, 'Google Login');
		} finally {
			hideLoading();
		}
	};

	const setEmailOrPhone = (text: string) => {
		const trimmed = text.trim();
		const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
		if (isEmail) {
			setEmail(trimmed);
		} else {
			const phone = parsePhoneNumberFromString(trimmed, 'PH');
			setEmail(phone?.isValid() ? phone.format('E.164') : trimmed);
		}
	};

	return (
		<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 0 }]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 105}
			>
					<BackHeader />
					<View style={styles.topSection}>
						<CText fontSize={40} fontStyle="B" style={{ color: theme.colors.light.primary }}>
							{APP_NAME}
						</CText>
						<CText fontSize={16} style={{ color: '#000', marginTop: 6 }}>
							Access your account
						</CText>
					</View>

					<View style={{ paddingHorizontal: 24, marginTop: 40 }}>
						<CText fontSize={14} style={styles.label}>Email or Phone</CText>
						<View style={styles.inputWrapper}>
							<Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
							<TextInput
								placeholder="Enter email or phone"
								placeholderTextColor="#AAA"
								value={email}
								onChangeText={(text) => { setEmailOrPhone(text); setEmailError(''); }}
								style={[styles.input, emailError && styles.inputError]}
								keyboardType="email-address"
								autoCapitalize="none"
							/>
						</View>
						{emailError && (
							<View style={styles.errorRow}>
								<Icon name="alert-circle" size={14} color="#FF4C4C" />
								<CText style={styles.errorText}>{emailError}</CText>
							</View>
						)}

						<CText fontSize={14} style={styles.label}>Password</CText>
						<View style={styles.inputWrapper}>
							<Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
							<TextInput
								placeholder="Enter password"
								placeholderTextColor="#AAA"
								secureTextEntry={!showPassword}
								value={password}
								onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
								style={[styles.input, passwordError && styles.inputError]}
								autoCapitalize="none"
							/>
							<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
								<Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
							</TouchableOpacity>
						</View>
						{passwordError && (
							<View style={styles.errorRow}>
								<Icon name="alert-circle" size={14} color="#FF4C4C" />
								<CText style={styles.errorText}>{passwordError}</CText>
							</View>
						)}

						<TouchableOpacity
							style={[styles.button, globalStyles.shadowBtn]}
							onPress={handleLogin}
							activeOpacity={0.9}
							disabled={loading}
						>
							{loading ? <ActivityIndicator color="#fff" /> : <CText fontSize={16} style={styles.buttonText}>Sign In</CText>}
						</TouchableOpacity>

						<View style={styles.dividerContainer}>
							<View style={styles.divider} />
							<CText fontSize={12} style={styles.dividerText}>OR</CText>
							<View style={styles.divider} />
						</View>

						<View style={styles.authSection}>
							{isBiometricEnabled && (
								<TouchableOpacity style={styles.authButton} onPress={handleBiometricLogin}>
									<Icon name="finger-print-outline" size={22} color={theme.colors.light.primary} />
									<CText style={styles.authTextWhite}>Fingerprint</CText>
								</TouchableOpacity>
							)}
							<TouchableOpacity style={styles.authButton} onPress={handleGoogleLogin}>
								<Icon name="logo-google" size={22} color="#DB4437" />
								<CText style={styles.authText}>Continue with Google</CText>
							</TouchableOpacity>

							<TouchableOpacity style={styles.authButton} onPress={() => navigation.navigate('Login')}>
								<Icon name="key-outline" size={22} color={theme.colors.light.primary} />
								<CText style={styles.authTextWhite}>Login with Password</CText>
							</TouchableOpacity>

						</View>
					</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	authSection: {
		alignItems: 'center',
		gap: 10,
	},
	loginLabel: {
		color: '#fff',
		marginBottom: 10,
	},
	container: {
		flex: 1,
	},
	topSection: {
		alignItems: 'center',
		marginTop: 120,
		marginBottom: 20,
	},
	label: {
		color: '#333',
		fontWeight: '600',
		marginBottom: 6,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F9F9F9',
		borderRadius: theme.radius.sm,
		paddingHorizontal: 12,
		marginBottom: 14,
		borderWidth: 1,
		borderColor: '#E5E5E5',
	},
	inputIcon: {
		marginRight: 8,
	},
	input: {
		flex: 1,
		height: 48,
		fontSize: 15,
		color: '#000',
	},
	inputError: {
		borderColor: '#FF4C4C',
		backgroundColor: '#FFF5F5',
	},
	errorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		marginTop: -8,
	},
	errorText: {
		color: '#FF4C4C',
		fontSize: 12,
		marginLeft: 4,
	},
	button: {
		backgroundColor: theme.colors.light.primary,
		paddingVertical: 14,
		borderRadius: theme.radius.sm,
		marginTop: 10,
		marginBottom: 20,
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	dividerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 20,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: '#ddd',
	},
	dividerText: {
		marginHorizontal: 10,
		color: '#aaa',
		fontWeight: '500',
	},
	socialButtons: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
	},
	socialBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderRadius: theme.radius.sm,
	},
	socialLabel: {
		marginLeft: 8,
		fontWeight: '600',
		fontSize: 14,
		color: '#333',
	},
	biometricBtn: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 50,
		padding: 14,
		justifyContent: 'center',
		alignItems: 'center',
		width: 56,
		height: 56,
	},
	authButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: theme.radius.sm,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 6,
		width: '100%',
		borderWidth: 1,
		borderColor: '#ccc',
	},
	authButtonOutline: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: theme.colors.light.primary,
		borderWidth: 1,
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: theme.radius.sm,
	},
	authText: {
		marginLeft: 10,
		fontWeight: '600',
		color: theme.colors.light.primary,
		fontSize: 15,
	},
	authTextWhite: {
		marginLeft: 10,
		fontWeight: '600',
		color: theme.colors.light.primary,
		fontSize: 15,
	},
	fingerprint: {
		alignItems: 'center',
		marginTop: 20,
	},
	bioText: {
		marginTop: 8,
		color: '#fff',
		fontSize: 14,
	},
});

export default SigninForm;
