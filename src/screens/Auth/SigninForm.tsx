import React, { useContext, useEffect, useState } from 'react';
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
	SafeAreaView,
	ImageBackground, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../../context/AuthContext.tsx';
import { useLoading } from '../../context/LoadingContext.tsx';
import { useAlert } from '../../components/CAlert.tsx';
import { loginWithBiometric } from '../../hooks/useBiometrics.ts';
import { authLogin, loginWithGoogle } from '../../api/modules/auth.ts';
import { globalStyles } from '../../theme/styles';
import { theme } from '../../theme';
import { CText } from '../../components/CText.tsx';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_CLIENT_ID } from '../../api/api_configuration.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';
import BackHeader from '../../components/BackHeader.tsx';
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

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');

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
					} else {
						console.log('[ONLINE] Validating...');
						await loginAuth(sessionData);
						navigation.replace('Home');
					}
				}
			} catch (err) {
			}
		};

		checkSession();
	}, []);

	const init = async () => {
		const email = await AsyncStorage.getItem('biometricUserEmail');
		const result = await checkBiometricSupport();
		const flagKey = `biometricEnabled:${email}`;
		const flag = await AsyncStorage.getItem(flagKey);
		const isSupported = result.supported;
		const isEnabled = flag === 'true';

		console.log("isSupportedss: ", isSupported)

		setIsBiometricEnabled(isSupported && isEnabled);
	};



	useEffect(() => {
		init();
		// init();
	}, []);

	const handleLogin = async () => {
		showLoading('Signing in...');
		setEmailError('');
		setPasswordError('');
		try {
			if (isOnline) {
				const response = await authLogin({ email, password });
				if (response.status === 200) {
					const sessionData = { ...response.data, password };

					await loginAuth(response.data);
					await AsyncStorage.setItem('isLoggedIn', 'true');
					await AsyncStorage.setItem('mobile', sessionData.token);
					await Keychain.setGenericPassword(JSON.stringify(sessionData), sessionData.token);
				}
			} else {
				const cachedSession = await Keychain.getGenericPassword();

				if (cachedSession) {
					const sessionData = JSON.parse(cachedSession.username);
					const isMatch = await bcrypt.compare(password, sessionData.password);

					if (sessionData.email === email && isMatch) {
						const sessionDatasss = {
							user: sessionData,
							token: cachedSession.password,
							roles: sessionData.roles,
							permissions: sessionData.permissions
						};
						await loginAuth(sessionDatasss);
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
		} catch (error) {
			console.error('Login Error:', error);
			setEmailError('Login failed. Please try again.');
			setPasswordError('');
			handleApiError(error, 'Login');
		} finally {
			hideLoading();
		}
	};

	const handleBiometricLogin = async () => {
		try {
			const session = await loginWithBiometric();
			if(session){
				console.log(session)
				await loginAuth(session);
				await AsyncStorage.setItem('isLoggedIn', 'true');
				await AsyncStorage.setItem("mobile", session.token);
			}
		} catch (err) {
			handleApiError(err, 'BIo');
		}
	};

	const handleGoogleLogin = async () => {
		await GoogleSignin.hasPlayServices();
		await GoogleSignin.signOut();
		try {
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
		}  catch (error) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Something went wrong during Google login.';

			Alert.alert('Login Failed', message);

			if (error?.response?.status === 404) {
				console.warn('User not found.');
			}

			handleApiError(error, 'Login');
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
					<BackHeader />
					<Text>{'\n\n\n'}</Text>
					<View style={styles.topSection}>
						<CText fontSize={38} fontStyle={'B'} style={{ color: theme.colors.light.primary }}>Sign In</CText>
						<CText style={{ color: '#000' }}>Sign in to continue</CText>
					</View>

					<View style={{ padding: 24 }}>
						<CText fontSize={16} style={{ color: '#000', fontWeight: '600' }}>Email</CText>
						<TextInput
							placeholderTextColor="#888"
							value={email}
							onChangeText={(text) => {
								setEmailOrPhone(text);
								setEmailError('');
							}}
							style={[
								styles.input,
								emailError ? styles.inputError : null
							]}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						{emailError !== '' && <CText style={styles.errorText}>{emailError}</CText>}

						<CText fontSize={16} style={{ color: '#000', fontWeight: '600' }}>Password</CText>
						<TextInput
							placeholderTextColor="#888"
							autoCapitalize="none"
							autoCorrect={false}
							value={password}
							onChangeText={(text) => {
								setPassword(text);
								setPasswordError('');
							}}
							style={[
								styles.input,
								passwordError ? styles.inputError : null
							]}
							secureTextEntry
						/>
						{passwordError !== '' && <CText style={styles.errorText}>{passwordError}</CText>}

						<TouchableOpacity
							style={[styles.button, globalStyles.shadowBtn]}
							onPress={handleLogin}
							activeOpacity={0.8}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color={theme.colors.light.primary} />
							) : (
								<CText fontSize={16} style={styles.buttonText}>Sign In</CText>
							)}
						</TouchableOpacity>

						{/*<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>*/}
						{/*	<TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>*/}
						{/*		<CText fontSize={14} style={{ color: '#000', fontWeight: 'bold' }}>Forgot Password?</CText>*/}
						{/*	</TouchableOpacity>*/}
						{/*</View>*/}

						<View style={styles.dividerContainer}>
							<View style={styles.divider} />
							<Text style={styles.dividerText}>or with</Text>
							<View style={styles.divider} />
						</View>

						<View style={styles.socialButtons}>
							<TouchableOpacity onPress={handleGoogleLogin} style={[globalStyles.socialButton, {borderWidth: 1, borderColor: '#ccc'}]}>
								<Icon name="logo-google" size={24} color="#DB4437" />
								<CText style={{ color: '#DB4437', fontSize: 12, fontWeight: 'bold', marginTop: 5 }}>Google</CText>
							</TouchableOpacity>
							{isBiometricEnabled && (
								<TouchableOpacity onPress={handleBiometricLogin} style={[globalStyles.socialButton, {borderWidth: 1, borderColor: '#ccc'}]}>
									<Icon name="finger-print" size={36} color={theme.colors.light.primary} />
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
	topSection: {
		alignItems: 'center',
		marginTop: 50,
	},
	container: {
		flex: 1,
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
	errorText: {
		color: '#FF4C4C',
		fontSize: 12,
		marginBottom: 10,
		marginTop: -10
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
});

export default SigninForm;
