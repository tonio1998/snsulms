import React, { useCallback, useContext, useState } from 'react';
import {
	Alert,
	View,
	StyleSheet,
	Image,
	Switch,
	TouchableOpacity,
	ScrollView,
	SafeAreaView,
	RefreshControl,
	ToastAndroid,
} from 'react-native';
import { useAuth } from '../../context/AuthContext.tsx';
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { globalStyles } from '../../theme/styles.ts';
import { CText } from '../../components/common/CText.tsx';
import { useAlert } from '../../components/CAlert.tsx';
import { getUserDetails, updateProfilePicture } from '../../api/modules/userApi.ts';
import { formatAcad } from '../../utils/format.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { FILE_BASE_URL } from '../../../env.ts';
import HorizontalLine from '../../components/HorizontalLine.tsx';
import { useLoading } from '../../context/LoadingContext.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackHeader from '../../components/layout/BackHeader.tsx';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { getAcademicInfo } from '../../utils/getAcademicInfo.ts';
import { useFocusEffect } from '@react-navigation/native';
import ActivityIndicator2 from "../../components/loaders/ActivityIndicator2.tsx";
import CButton from "../../components/buttons/CButton.tsx";

export default function ProfileScreen({ navigation }) {
	const network = useContext(NetworkContext);
	const { showAlert } = useAlert();
	const { showLoading, hideLoading } = useLoading();
	const [refreshing, setRefreshing] = useState(false);
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [roles, setRoles] = useState([]);
	const [acad, setAcad] = useState(null);

	const {
		isBiometricSupported,
		biometricEnabled,
		enableBiometricLogin,
		disableBiometricLogin,
		user,
		logout,
	} = useAuth();

	// Load data from AsyncStorage cache
	const loadFromCache = async () => {
		try {
			const storedRoles = await AsyncStorage.getItem('roles');
			if (storedRoles) setRoles(JSON.parse(storedRoles));

			const cachedData = await AsyncStorage.getItem('user_data_' + user?.id);
			if (cachedData) {
				setUserData(JSON.parse(cachedData));
			} else {
				await fetchOnline();
			}
		} catch (e) {
			console.error('Error loading from cache:', e);
		}
	};

	const fetchOnline = async () => {
		try {
			if (!network?.isOnline) {
				return;
			}

			console.log("🔍 Fetching user data from API", user?.id);
			const res = await getUserDetails(user?.id);
			await AsyncStorage.setItem('user_data_' + user?.id, JSON.stringify(res));
			setUserData(res);
			console.log('[ONLINE] Data updated');
		} catch (e) {
			handleApiError(e, 'User Details');
		}
	};

	const initFetch = async () => {
		// setLoading(true);
		await loadFromCache();
		// setLoading(false);
	};

	useFocusEffect(
		useCallback(() => {
			(async () => {
				await initFetch();
				const acadInfo = await getAcademicInfo();
				setAcad(acadInfo);
			})();
		}, [])
	);

	// Pull-to-refresh → always fetch online
	const onRefresh = useCallback(async () => {
		setLoading(true);
		await fetchOnline();
		setLoading(false);
	}, []);

	const handleLogout = () => {
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Logout',
				onPress: async () => {
					try {
						await logout();
					} catch (error) {
						console.error('Logout failed:', error);
					}
				},
			},
		]);
	};

	const handleChangeProfilePic = () => {
		launchImageLibrary({ mediaType: 'photo' }, async (response) => {
			if (response.didCancel) return;

			const asset = response.assets?.[0];
			if (!asset?.uri) {
				Alert.alert('Error', 'No image selected');
				return;
			}

			showLoading('Uploading...');
			try {
				await updateProfilePicture(user.id, asset);
				await fetchOnline();
				showAlert('success', 'Success', 'Profile picture updated!');
			} catch (error) {
				console.error(error);
				handleApiError(error, 'Profile Picture Update');
			} finally {
				hideLoading();
			}
		});
	};

	const handleShowQR = () => {
		navigation.navigate('myQR');
	};

	return (
		<>
			<BackHeader rightButton={
				<TouchableOpacity onPress={handleLogout} style={{ borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
					<Icon name="log-out-outline" size={23} color={theme.colors.light.danger} />
					<CText fontSize={17} style={{ marginLeft: 5, color: theme.colors.light.danger }}>Logout</CText>
				</TouchableOpacity>
			}/>
			<SafeAreaView style={[globalStyles.safeArea, { flex: 1, padding: 15 }]}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 40 }}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				>
					{loading && (
						<>
							<ActivityIndicator2 />
						</>
					)}
					<View style={{ alignItems: 'center', marginTop: 40 }}>
						<TouchableOpacity
							onPress={handleChangeProfilePic}
							style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }}
						>
							<Image
								source={
									userData?.profile_pic
										? { uri: `${FILE_BASE_URL}/${userData.profile_pic}`, cache: 'force-cache' }
										: userData?.avatar
											? { uri: userData.avatar, cache: 'force-cache' }
											: {
												uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
													userData?.name || 'User'
												)}&background=random`,
												cache: 'force-cache'
											}
								}
								style={styles.avatar}
							/>
						</TouchableOpacity>

						<View style={{ marginTop: 16, alignItems: 'center' }}>
							{loading ? (
								<>
									<ShimmerPlaceHolder
										LinearGradient={LinearGradient}
										style={[styles.shimmerText, { width: 140 }]}
										autoRun
									/>
									<ShimmerPlaceHolder
										LinearGradient={LinearGradient}
										style={[styles.shimmerText, { width: 100, marginTop: 8 }]}
										autoRun
									/>
								</>
							) : (
								<>
									<CText fontSize={22} style={{ fontWeight: 'bold', color: '#222' }}>
										{userData?.name || 'Unnamed User'}
									</CText>
									<CText fontSize={15} style={{ marginTop: 4, color: '#666' }}>
										{userData?.email || 'No email'}
									</CText>
								</>
							)}

							<View style={{ alignItems: 'center', marginVertical: 10 }}>
								<CButton
									title={"Generate QR Code"}
									icon={"image-outline"}
									onPress={handleShowQR}
									type="success"
								/>
							</View>
						</View>
					</View>

					<View style={styles.infoCard}>
						<View style={styles.rowSpaceBetween}>
							<CText fontSize={15} style={styles.label}>
								Academic Year
							</CText>
							<View style={styles.acadContainer}>
								<TouchableOpacity style={{
									flexDirection: 'row',
									alignItems: 'center',
									// gap: 6
								}} onPress={() => navigation.navigate('AcademicYear')}>
									<Icon name="pencil" size={18} color={theme.colors.light.primary} />
									<CText fontSize={15} fontStyle="SB" style={{ marginLeft: 6 }}>
										{formatAcad(acad?.semester, acad?.from, acad?.to)}
									</CText>
								</TouchableOpacity>
							</View>
						</View>

						{/*<View style={styles.rowSpaceBetween}>*/}
						{/*	<CText fontSize={15} style={styles.label}>*/}
						{/*		Roles*/}
						{/*	</CText>*/}
						{/*	<CText fontSize={15} style={{ fontWeight: 'bold', color: '#444' }}>*/}
						{/*		{roles?.map((r) => r?.toUpperCase()).join(', ')}*/}
						{/*	</CText>*/}
						{/*</View>*/}


						{isBiometricSupported && (
							<View style={styles.rowSpaceBetween}>
								<CText fontSize={15} style={styles.label}>
									Biometric Login
								</CText>
								<Switch
									value={biometricEnabled}
									onValueChange={async (val) => {
										try {
											if (val) await enableBiometricLogin();
											else await disableBiometricLogin();
										} catch {
											ToastAndroid.show('Failed to update biometric settings.', ToastAndroid.SHORT);
										}
									}}
									trackColor={{ false: '#ccc', true: theme.colors.light.primary }}
									thumbColor={biometricEnabled ? theme.colors.light.primary : '#f4f3f4'}
								/>
							</View>
						)}
					</View>
				</ScrollView>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	logoutButton: {
		backgroundColor: '#f00',
		padding: 10,
		paddingHorizontal: 15,
		borderRadius: 8,
		flexDirection: 'row'
	},
	infoCard: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 12,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		// elevation: 3,
	},
	avatar: {
		width: 150,
		height: 150,
		borderRadius: 100,
		borderWidth: 2,
		borderColor: theme.colors.light.primary,
	},
	shimmerText: {
		height: 20,
		borderRadius: 10,
		marginTop: 10,
		marginBottom: 10,
	},
	rowSpaceBetween: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 16,
	},
	label: {
		fontWeight: 'bold',
		color: '#333',
		marginRight: 8,
		width: '40%',
	},
	acadContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});
