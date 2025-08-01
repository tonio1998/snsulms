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
	Alert,
	Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme';
import { loginWithBiometric } from '../../hooks/useBiometrics.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLoading } from '../../context/LoadingContext.tsx';
import { authLogin, loginWithGoogle } from '../../api/modules/auth.ts';
import checkBiometricSupport from '../../services/checkBiometricSupport.ts';
import { CText } from '../../components/common/CText.tsx';
import { handleApiError } from '../../utils/errorHandler.ts';
import * as Keychain from 'react-native-keychain';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { APP_NAME, GOOGLE_CLIENT_ID, TAGLINE } from '../../../env.ts';

const { width } = Dimensions.get('window');

GoogleSignin.configure({
	webClientId: GOOGLE_CLIENT_ID,
	offlineAccess: true,
	scopes: ['https://www.googleapis.com/auth/calendar'],
});

export default function LoginOptionsScreen() {
	const navigation = useNavigation();
	const { loginAuth } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [loading, setLoading] = useState(false);
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

	useEffect(() => {
		(async () => {
			const email = await AsyncStorage.getItem('biometricUserEmail');
			const flagKey = `biometricEnabled:${email}`;
			const flag = await AsyncStorage.getItem(flagKey);
			const result = await checkBiometricSupport();
			setIsBiometricEnabled(result.supported && flag === 'true');
		})();
	}, []);

	const handleBiometricLogin = async () => {
		try {
			const session = await loginWithBiometric();
			if (session) {
				setLoading(true);
				await loginAuth(session);
				await AsyncStorage.setItem('isLoggedIn', 'true');
				await AsyncStorage.setItem('mobile', session.token);
			}
		} catch (err) {
			handleApiError(err, 'Biometric');
		} finally {
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
			await loginAuth(response.data);
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Something went wrong during Google login.';
			Alert.alert('Login Failed', 'Something went wrong during Google login.');
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
				<View style={styles.wrapper}>
					<View style={styles.header}>
						<Image source={require('../../../assets/img/ic_launcher.png')} style={styles.logo} />
						<CText fontStyle="B" fontSize={40} style={styles.appName}>{APP_NAME}</CText>
						<CText fontStyle="R" fontSize={14} style={styles.tagline}>{TAGLINE}</CText>
					</View>

					<View style={styles.authSection}>
						{loading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#fff" />
								<CText style={styles.loadingText}>Logging in...</CText>
							</View>
						) : (
							<>
								<CText style={styles.loginLabel}>Sign in to continue</CText>
								<TouchableOpacity style={styles.authButton} onPress={handleGoogleLogin}>
									<Icon name="logo-google" size={22} color="#DB4437" />
									<CText style={styles.authText}>Continue with Google</CText>
								</TouchableOpacity>

								<TouchableOpacity style={styles.authButtonOutline} onPress={() => navigation.navigate('Login')}>
									<Icon name="key-outline" size={22} color="#fff" />
									<CText style={styles.authTextWhite}>Login with Password</CText>
								</TouchableOpacity>

								{isBiometricEnabled && (
									<TouchableOpacity onPress={handleBiometricLogin} style={styles.fingerprint}>
										<Icon name="finger-print-outline" size={40} color="#fff" />
										<CText style={styles.bioText}>Use Biometrics</CText>
									</TouchableOpacity>
								)}
							</>
						)}
					</View>

					{/* Footer */}
					<View style={styles.footer}>
						<CText fontSize={11} style={styles.footerText}>Developed by SNSU - ICT fgWorkz</CText>
						<CText fontSize={11} style={styles.footerText}>Version {version} • © 2025 All rights reserved</CText>
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
	wrapper: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 28,
		paddingVertical: 70,
	},
	header: {
		alignItems: 'center',
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 12,
	},
	appName: {
		color: '#fff',
		textAlign: 'center',
		marginBottom: 4,
	},
	tagline: {
		color: '#ddd',
		textAlign: 'center',
	},
	authSection: {
		alignItems: 'center',
		gap: 16,
	},
	loginLabel: {
		color: '#fff',
		fontSize: 16,
		marginBottom: 10,
		fontWeight: '500',
	},
	authButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: theme.radius.sm,
		width: width * 0.8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 6,
		elevation: 2,
	},
	authButtonOutline: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: '#fff',
		borderWidth: 1,
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: theme.radius.sm,
		width: width * 0.8,
	},
	authText: {
		marginLeft: 10,
		fontWeight: '600',
		color: '#333',
		fontSize: 15,
	},
	authTextWhite: {
		marginLeft: 10,
		fontWeight: '600',
		color: '#fff',
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
	loadingContainer: {
		alignItems: 'center',
	},
	loadingText: {
		color: '#fff',
		marginTop: 10,
		fontSize: 15,
	},
	footer: {
		alignItems: 'center',
		marginTop: 30,
	},
	footerText: {
		color: '#ccc',
		textAlign: 'center',
	},
});
