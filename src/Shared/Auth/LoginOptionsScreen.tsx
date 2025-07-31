import React, { useEffect, useState, version } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	SafeAreaView,
	ImageBackground,
	ToastAndroid, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontFamily, theme } from '../../theme';
import { loginWithBiometric } from '../../hooks/useBiometrics.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { globalStyles } from '../../theme/styles.ts';
import { useLoading } from '../../context/LoadingContext.tsx';
import { authLogin, loginWithGoogle } from '../../api/modules/auth.ts';
import checkBiometricSupport from '../../services/checkBiometricSupport.ts';
import { CText } from '../../components/common/CText.tsx';
import { handleApiError } from '../../utils/errorHandler.ts';
import * as Keychain from 'react-native-keychain';
import RNFS from 'react-native-fs';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {APP_NAME, GOOGLE_CLIENT_ID, TAGLINE} from '../../../env.ts';
import NetInfo from '@react-native-community/netinfo';
GoogleSignin.configure({
	webClientId: GOOGLE_CLIENT_ID,
	offlineAccess: true,
	scopes: ['https://www.googleapis.com/auth/calendar'],
});
export default function LoginOptionsScreen() {
	const navigation = useNavigation();
	const { loginAuth } = useAuth();
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const [loading, setLoading] = useState(false);

	const checkSession = async () => {
		try {
			const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
			const cachedSession = await Keychain.getGenericPassword();
			if (isLoggedIn && cachedSession) {
				const username = JSON.parse(cachedSession.username)
				const password = await AsyncStorage.getItem("mobile");
				const sessionData = {
					user: username,
					roles: username.roles,
					permissions: username.permissions,
					token: password
				};

				await loginAuth(sessionData);
			}
		} catch (err) {
		}
	};

	const init = async () => {
		const email = await AsyncStorage.getItem('biometricUserEmail');
		const result = await checkBiometricSupport();
		const flagKey = `biometricEnabled:${email}`;
		const flag = await AsyncStorage.getItem(flagKey);
		const isSupported = result.supported;
		const isEnabled = flag === 'true';

		setIsBiometricEnabled(isSupported && isEnabled);
	};



	useEffect(() => {
		init();
		// checkSession();
		// showLoading('Logging in...');
	}, []);

	const handleBiometricLogin = async () => {
		try {
			const session = await loginWithBiometric();

			if(session){
				setLoading(true);
				// showLoading('Logging in...', -1);
				await loginAuth(session);
				await AsyncStorage.setItem('isLoggedIn', 'true');
				await AsyncStorage.setItem("mobile", session.token);
			}
		} catch (err) {
			handleApiError(err, 'BIo');
		} finally {
			// hideLoading();
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		try {
			await GoogleSignin.hasPlayServices();
			await GoogleSignin.signOut();
			const userInfo = await GoogleSignin.signIn();
			const tokens = await GoogleSignin.getTokens();
			const accessToken = tokens.accessToken;
			showLoading('Logging in...');
			const user = userInfo?.data?.user;
			// console.log('tokens: ', tokens)
			const idToken = userInfo?.data?.idToken;
			await AsyncStorage.setItem('googleAccessToken'+user?.email, accessToken);

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

	return (
		<SafeAreaView style={styles.container}>
			<ImageBackground
				source={require('../../../assets/img/bg2.png')}
				style={styles.container}
				resizeMode="cover"
			>
				<View style={styles.contentWrapper}>
					{/* Logo & App Name */}
					<View style={styles.header}>
						<Image source={require('../../../assets/img/ic_launcher.png')} style={styles.logo} />
						<CText fontStyle="B" fontSize={34} style={styles.appName}>
							{APP_NAME}
						</CText>
						<CText fontStyle="M" fontSize={14} style={styles.tagline}>
							{TAGLINE}
						</CText>
					</View>

					<View style={styles.authSection}>
						{loading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#fff" />
								<CText style={styles.loadingText}>Logging in...</CText>
							</View>
						) : (
							<>
								<CText style={styles.loginLabel}>Continue with</CText>
								<View style={styles.authButtons}>
									<TouchableOpacity style={styles.authButton} onPress={handleGoogleLogin}>
										<Icon name="logo-google" size={26} color="#DB4437" />
										<CText style={styles.authText}>Google</CText>
									</TouchableOpacity>

									<TouchableOpacity style={styles.authButton} onPress={() => navigation.navigate('Login')}>
										<Icon name="key-outline" size={26} color={theme.colors.light.primary} />
										<CText style={styles.authText}>Password</CText>
									</TouchableOpacity>
								</View>

								{isBiometricEnabled && (
									<TouchableOpacity onPress={handleBiometricLogin} style={styles.fingerprint}>
										<Icon name="finger-print-outline" size={40} color="#fff" />
									</TouchableOpacity>
								)}
							</>
						)}
					</View>

					<View style={styles.footer}>
						<CText fontSize={12} style={styles.footerText}>
							Developed by SNSU - ICT fgWorkz
						</CText>
						<CText fontSize={12} style={styles.footerText}>
							Version {version} • © 2025 All rights reserved
						</CText>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	);

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.light.primary,
	},
	contentWrapper: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 30,
		paddingTop: 60,
		paddingBottom: 30,
	},
	header: {
		alignItems: 'center',
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 10,
	},
	appName: {
		color: '#fff',
		textAlign: 'center',
	},
	tagline: {
		color: '#eee',
		textAlign: 'center',
		marginTop: -5,
	},
	authSection: {
		alignItems: 'center',
		marginTop: 100,
	},
	loginLabel: {
		color: '#fff',
		fontSize: 16,
		marginBottom: 20,
		fontWeight: '600',
	},
	authButtons: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		width: '100%',
	},
	authButton: {
		backgroundColor: '#ffffff',
		paddingVertical: 15,
		paddingHorizontal: 25,
		borderRadius: 12,
		marginHorizontal: 10,
		alignItems: 'center',
		width: 120,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		// elevation: 5,
	},
	authText: {
		marginTop: 8,
		fontWeight: 'bold',
		color: '#333',
	},
	fingerprint: {
		marginTop: 30,
		padding: 12,
		backgroundColor: '#ffffff20',
		borderRadius: 50,
	},
	loadingContainer: {
		alignItems: 'center',
	},
	loadingText: {
		color: '#fff',
		marginTop: 10,
	},
	footer: {
		alignItems: 'center',
	},
	footerText: {
		color: '#ccc',
		textAlign: 'center',
	},
});
