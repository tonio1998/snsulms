import React, { useContext, useEffect, useState } from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	Text,
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
import { GOOGLE_CLIENT_ID } from '../../../env.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as Keychain from 'react-native-keychain';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import bcrypt from 'bcryptjs';
import checkBiometricSupport from '../../services/checkBiometricSupport.ts';
import BackHeader from '../../components/layout/BackHeader.tsx';

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
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	useEffect(() => {
		(async () => {
			// await initBiometric();
			// await checkSession();
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
					console.log("response", response);
					const sessionData = { ...response.data, password };

					await loginAuth(response.data);
					await AsyncStorage.setItem('isLoggedIn', 'true');
					await AsyncStorage.setItem('mobile', sessionData.token);
					await Keychain.setGenericPassword(JSON.stringify(sessionData), sessionData.token);
				} catch (err) {
					console.error('Login error:', err);
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
						setEmailError('Incorrect email.');
						setPasswordError('Incorrect password.');
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
			const user = userInfo?.user;
			const idToken = userInfo?.idToken;

			showLoading('Logging in...');
			await AsyncStorage.setItem(`googleAccessToken${user?.email}`, accessToken);

			const response = await loginWithGoogle({
				token: idToken,
				name: user?.name,
				email: user?.email,
				photo: user?.photo,
			});
			await loginAuth(response.data);
		} catch (error) {
			Alert.alert('Login Failed', 'Something went wrong during Google login.');
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
		<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 0}]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 105}
			>
				<ImageBackground
					source={require('../../../assets/img/bg.png')}
					style={styles.container}
					resizeMode="cover"
				>
					<BackHeader />
					<View style={styles.topSection}>
						<CText fontSize={40} fontStyle="B" style={{ color: colors.primary }}>
							Sign In
						</CText>
						<CText fontSize={16} style={{ color: '#000', marginTop: 6 }}>
							Access your account
						</CText>
					</View>

					<View style={{ paddingHorizontal: 24, marginTop: 40 }}>
						{/* Email */}
						<CText fontSize={14} style={styles.label}>
							Email or Phone
						</CText>
						<TextInput
							placeholder="Enter email or phone"
							placeholderTextColor="#AAA"
							value={email}
							onChangeText={(text) => { setEmailOrPhone(text); setEmailError(''); }}
							style={[styles.input, emailError && styles.inputError]}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						{emailError && <CText style={styles.errorText}>{emailError}</CText>}

						{/* Password */}
						<CText fontSize={14} style={styles.label}>
							Password
						</CText>
						<TextInput
							placeholder="Enter password"
							placeholderTextColor="#AAA"
							secureTextEntry
							value={password}
							onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
							style={[styles.input, passwordError && styles.inputError]}
							autoCapitalize="none"
						/>
						{passwordError && <CText style={styles.errorText}>{passwordError}</CText>}

						{/* Sign In Button */}
						<TouchableOpacity
							style={[styles.button, globalStyles.shadowBtn]}
							onPress={handleLogin}
							activeOpacity={0.8}
							disabled={loading}
						>
							{loading ? <ActivityIndicator color="#fff" /> : <CText fontSize={16} style={styles.buttonText}>Sign In</CText>}
						</TouchableOpacity>

						{/* Divider */}
						<View style={styles.dividerContainer}>
							<View style={styles.divider} />
							<CText fontSize={12} style={styles.dividerText}>
								OR
							</CText>
							<View style={styles.divider} />
						</View>

						{/* Social & Biometric */}
						<View style={styles.socialButtons}>
							<TouchableOpacity onPress={handleGoogleLogin} style={[styles.socialBtn]}>
								<Icon name="logo-google" size={28} color="#DB4437" />
								<CText style={styles.socialLabel}>Google</CText>
							</TouchableOpacity>

							{isBiometricEnabled && (
								<TouchableOpacity onPress={handleBiometricLogin} style={[styles.socialBtn]}>
									<Icon name="finger-print" size={32} color={colors.primary} />
								</TouchableOpacity>
							)}
						</View>
					</View>
				</ImageBackground>

			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	topSection: {
		alignItems: 'center',
		marginTop: 120,
		marginBottom: 20,
	},
	formContainer: {
		marginHorizontal: 20,
		padding: 24,
		borderRadius: 20,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
	},
	input: {
		height: 50,
		backgroundColor: '#F5F5F5',
		borderRadius: 12,
		paddingHorizontal: 16,
		fontSize: 16,
		marginBottom: 14,
		color: '#000',
	},
	inputError: {
		borderWidth: 1,
		borderColor: '#FF4C4C',
		backgroundColor: '#FFF0F0',
	},
	label: {
		color: '#333',
		fontWeight: '600',
		marginBottom: 6,
	},
	errorText: {
		color: '#FF4C4C',
		fontSize: 12,
		marginBottom: 10,
		marginTop: -8,
	},
	button: {
		backgroundColor: theme.colors.light.primary,
		paddingVertical: 14,
		borderRadius: 12,
		marginBottom: 20,
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontWeight: '800',
		fontSize: 16,
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
		gap: 20,
	},
	socialBtn: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 12,
		borderRadius: 12,
		alignItems: 'center',
		width: 100,
	},
	socialLabel: {
		color: '#333',
		fontSize: 12,
		fontWeight: 'bold',
		marginTop: 5,
	},
});

export default SigninForm;
