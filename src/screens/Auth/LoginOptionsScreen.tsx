import React, { useEffect, useState, version } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity, ActivityIndicator,
	SafeAreaView, ImageBackground, Alert, ToastAndroid
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FontFamily, theme} from '../../theme';
import { loginWithBiometric } from '../../hooks/useBiometrics.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { globalStyles } from '../../theme/styles.ts';
import { useLoading } from '../../context/LoadingContext.tsx';
import { authLogin, loginWithGoogle } from '../../api/modules/auth.ts';
import checkBiometricSupport from '../../services/checkBiometricSupport.ts';
import { CText } from '../../components/CText.tsx';
import { handleApiError } from '../../utils/errorHandler.ts';
import * as Keychain from 'react-native-keychain';
import RNFS from 'react-native-fs';
import { handleGoogleLogin } from '../../utils/authControl';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {APP_NAME, TAGLINE} from "../../api/api_configuration.ts";
import NetInfo from "@react-native-community/netinfo";

export default function LoginOptionsScreen() {
	const navigation = useNavigation();
	const { loginAuth } = useAuth();
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
	const { showLoading, hideLoading } = useLoading();

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

				console.log("sessionData: ", sessionData)

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
		checkSession();
		// showLoading('Logging in...');
	}, []);

	const handleBiometricLogin = async () => {
		try {
			const session = await loginWithBiometric();

			if(session){
				showLoading('Logging in...', -1);
				await loginAuth(session);
				await AsyncStorage.setItem('isLoggedIn', 'true');
				await AsyncStorage.setItem("mobile", session.token);
			}
		} catch (err) {
			handleApiError(err, 'BIo');
		} finally {
			hideLoading();
		}
	};

	const handleGoogleLogin = async () => {
		await GoogleSignin.hasPlayServices();
		await GoogleSignin.signOut();
		try {
			const userInfo = await GoogleSignin.signIn();
			showLoading('Logging in...', -1);
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

			ToastAndroid.show(message, ToastAndroid.SHORT);

			if (error?.response?.status === 404) {
				console.warn('User not found.');
			}
		} finally {
			hideLoading();
		}
	};

	const imagePath = `${RNFS.MainBundlePath}/img/launcher_icon.png`;

	return (
		<SafeAreaView style={[styles.container, { flex: 1 }]}>
			<ImageBackground
				source={require('../../../assets/img/bg2.png')}
				style={[styles.container]}
				resizeMode="cover"
				imageStyle={{ alignSelf: 'flex-start' }}
			>
				<View style={styles.topSection}>
					<Image
						source={require('../../../assets/img/ic_launcher.png')}
						style={[
							styles.logo,{
								width: 120,
								height: 120,
								marginBottom: 5
							}
						]} />
					<CText style={styles.title} fontStyle={'B'} fontSize={38} style={[globalStyles.shadowText, { color: '#fff', marginBottom: 10, fontFamily: FontFamily }]}>{APP_NAME}</CText>
					<CText fontStyle={'SB'} fontSize={13} style={[globalStyles.shadowText, { color: '#fff', marginBottom: 10, marginTop: -10 }]}>{TAGLINE}</CText>
				</View>
				<View style={styles.bottomSection}>
					<Text style={styles.linkText}>Login with</Text>
					<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 0}}>
						<View style={{ margin: 10, marginTop: 0}}>
							<TouchableOpacity activeOpacity={.4} style={[globalStyles.biometricBtn, globalStyles.shadowBtn, {marginBottom: 30, marginTop: 20, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff', borderWidth: 0}]} onPress={handleGoogleLogin}>
								<Icon name="logo-google" size={30} color={theme.colors.light.danger} />
								<CText style={{ color:theme.colors.light.danger, marginTop: 5, marginHorizontal: 10, fontWeight: 'bold' }}>Google</CText>
							</TouchableOpacity>
						</View>
						<View style={{ margin: 10, marginTop: 0}}>
							<TouchableOpacity activeOpacity={.4} style={[globalStyles.biometricBtn, globalStyles.shadowBtn, {marginBottom: 30, marginTop: 20, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff', borderWidth: 0}]} onPress={() => navigation.navigate('Login')}>
								<Icon name="key-outline" size={30} color={theme.colors.light.primary} />
								<CText style={{ color:theme.colors.light.primary, marginTop: 5, marginHorizontal: 10, fontWeight: 'bold' }}>Password</CText>
							</TouchableOpacity>
						</View>
					</View>
					{isBiometricEnabled && (
						<View style={{ margin: 10, marginTop: -30}}>
							<TouchableOpacity activeOpacity={.4} style={[{marginBottom: 30, marginTop: 20, borderRadius: 8, alignItems: 'center', padding: 10 }]} onPress={handleBiometricLogin}>
								<Icon name="finger-print-outline" size={40} color={theme.colors.light.card} />
							</TouchableOpacity>
						</View>
					)}
				</View>
				<View
					style={[
						styles.devNote,
						globalStyles.cardRow,
						{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							marginTop: 10,
							marginBottom: 30,
						},
					]}
				>
					<View>
						<CText
							fontSize={14}
							style={{
								marginLeft: 10,
								color: theme.colors.light.card,
								fontWeight: 'bold',
								textAlign: 'center'
							}}
						>
							Developed and Maintained by
						</CText>
						<CText
							fontSize={14}
							style={{
								marginLeft: 10,
								color: theme.colors.light.card,
								fontWeight: 'bold',
								textAlign: 'center'
							}}
						>
							SNSU - ICT fgWorkz
						</CText>
						<CText
							fontSize={14}
							style={{
								marginLeft: 10,
								color: theme.colors.light.card,
								fontWeight: 'bold',
							}}
						>
							Version {version} | All rights reserved © 2025
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
		// paddingHorizontal: 40,
		justifyContent: 'space-between',
	},
	topSection: {
		alignItems: 'center',
		marginTop: 70,
	},
	devNote: {
		fontSize: 14,
		color: '#D7D7D7',
		textAlign: 'center',
		fontWeight: 'bold',
		// marginBottom: -25,
		marginTop: 30,
		position: 'absolute',
		bottom: -30,
		// backgroundColor: theme.colors.light.background,
		right: 0,
		left: 0,
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		transform: [{ scale: 0.9 }],
	},
	logo: {
		width: 180,
		height: 180,
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#222',
	},
	bottomSection: {
		marginBottom: 80,
		color: '#fff',
		alignItems: 'center',
		// paddingHorizontal: 20,
		// backgroundColor: theme.colors.light.background,
	},
	button: {
		backgroundColor: theme.colors.light.secondary,
		paddingVertical: 14,
		paddingHorizontal: 40,
		borderRadius: theme.radius.sm,
		marginBottom: 20,
		width: '100%',
		alignItems: 'center',
	},
	buttonText: {
		color: '#000',
		fontSize: 16,
		fontWeight: 800,
	},

	linkText: {
		color: theme.colors.light.card,
		fontWeight: 'bold',
		fontSize: 15,
	},
	snsu: {
		width: 60,
		height: 60,
	},
});
