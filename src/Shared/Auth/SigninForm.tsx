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
import { useAlert } from '../../components/CAlert.tsx';
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
import NetInfo from '@react-native-community/netinfo';
import BackHeader from '../../components/layout/BackHeader.tsx';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import bcrypt from 'bcryptjs';
import checkBiometricSupport from '../../services/checkBiometricSupport.ts';

GoogleSignin.configure({
	webClientId: GOOGLE_CLIENT_ID,
	offlineAccess: true,
});

const SigninForm = ({ navigation }: any) => {
	const { isOnline } = useContext(NetworkContext);
	const isDarkMode = useColorScheme() === 'light';
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
			await initBiometric();
			await checkSession();
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
				const response = await authLogin({ email, password });
				const sessionData = { ...response.data, password };

				await loginAuth(response.data);
				await AsyncStorage.setItem('isLoggedIn', 'true');
				await AsyncStorage.setItem('mobile', sessionData.token);
				await Keychain.setGenericPassword(JSON.stringify(sessionData), sessionData.token);
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

			showLoading('Logging in...');
			const user = userInfo?.data?.user;
			const idToken = userInfo?.data?.idToken;

			const response = await loginWithGoogle({
				token: idToken,
				name: user?.name,
				email: user?.email,
				photo: user?.photo,
			});
			await loginAuth(response.data);
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Something went wrong during Google login.';
			Alert.alert('Login Failed', message);
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
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
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
						<CText fontSize={38} fontStyle="B" style={{ color: colors.primary }}>
							Sign In
						</CText>
						<CText style={{ color: '#000' }}>Sign in to continue</CText>
					</View>

					<View style={{ padding: 24 }}>
						{/* Email */}
						<CText fontSize={16} style={styles.label}>
							Email
						</CText>
						<TextInput
							placeholder="Enter email or phone"
							placeholderTextColor="#888"
							value={email}
							onChangeText={(text) => {
								setEmailOrPhone(text);
								setEmailError('');
							}}
							style={[styles.input, emailError && styles.inputError]}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						{emailError ? <CText style={styles.errorText}>{emailError}</CText> : null}

						{/* Password */}
						<CText fontSize={16} style={styles.label}>
							Password
						</CText>
						<TextInput
							placeholder="Enter password"
							placeholderTextColor="#888"
							secureTextEntry
							value={password}
							onChangeText={(text) => {
								setPassword(text);
								setPasswordError('');
							}}
							style={[styles.input, passwordError && styles.inputError]}
							autoCapitalize="none"
						/>
						{passwordError ? <CText style={styles.errorText}>{passwordError}</CText> : null}

						{/* Submit */}
						<TouchableOpacity
							style={[styles.button, globalStyles.shadowBtn]}
							onPress={handleLogin}
							activeOpacity={0.8}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color={colors.primary} />
							) : (
								<CText fontSize={16} style={styles.buttonText}>
									Sign In
								</CText>
							)}
						</TouchableOpacity>

						{/* Divider */}
						<View style={styles.dividerContainer}>
							<View style={styles.divider} />
							<Text style={styles.dividerText}>or with</Text>
							<View style={styles.divider} />
						</View>

						{/* Social Login */}
						<View style={styles.socialButtons}>
							<TouchableOpacity
								onPress={handleGoogleLogin}
								style={[globalStyles.socialButton, styles.socialBtn]}
							>
								<Icon name="logo-google" size={24} color="#DB4437" />
								<CText style={styles.socialLabel}>Google</CText>
							</TouchableOpacity>

							{isBiometricEnabled && (
								<TouchableOpacity
									onPress={handleBiometricLogin}
									style={[globalStyles.socialButton, styles.socialBtn]}
								>
									<Icon name="finger-print" size={36} color={colors.primary} />
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
	},
	input: {
		height: 50,
		backgroundColor: '#F5F5F5',
		borderRadius: 10,
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
		color: '#000',
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
		borderRadius: theme.radius.sm,
		marginBottom: 20,
		width: '100%',
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
		borderWidth: 1,
		borderColor: '#ccc',
	},
	socialLabel: {
		color: '#DB4437',
		fontSize: 12,
		fontWeight: 'bold',
		marginTop: 5,
	},
});

export default SigninForm;
