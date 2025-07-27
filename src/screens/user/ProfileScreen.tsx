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
import { CText } from '../../components/CText.tsx';
import { useAlert } from '../../components/CAlert.tsx';
import { getUserDetails, updateProfilePicture } from '../../api/modules/userApi.ts';
import { formatAcad } from '../../utils/format.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { FILE_BASE_URL } from '../../api/api_configuration.ts';
import HorizontalLine from '../../components/HorizontalLine.tsx';
import { useLoading } from '../../context/LoadingContext.tsx';
import BackgroundWrapper from '../../utils/BackgroundWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackHeader from '../../components/BackHeader.tsx';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { getAcademicInfo } from '../../utils/getAcademicInfo.ts';
import { useFocusEffect } from '@react-navigation/native';

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

	const fetchUserData = async () => {
		setLoading(true);
		try {
			const storedRoles = await AsyncStorage.getItem('roles');
			if (storedRoles) setRoles(JSON.parse(storedRoles));

			if (network?.isOnline) {
				const res = await getUserDetails(user?.id);
				await AsyncStorage.setItem('user_data_' + user?.id, JSON.stringify(res));
				setUserData(res);
			} else {
				const cachedData = await AsyncStorage.getItem('user_data_' + user?.id);
				if (cachedData) {
					setUserData(JSON.parse(cachedData));
					console.log('[OFFLINE] Loaded user data from cache');
				} else {
					console.warn('[OFFLINE] No cached user data found.');
				}
			}
		} catch (e) {
			console.error('Failed to fetch user data:', e);
			handleApiError(e, 'User Details');
		} finally {
			setLoading(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			(async () => {
				await fetchUserData();
				const acadInfo = await getAcademicInfo();
				setAcad(acadInfo);
			})();
		}, [])
	);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchUserData();
		setRefreshing(false);
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
				await fetchUserData();
				showAlert('success', 'Success', 'Profile picture updated!');
			} catch (error) {
				console.error(error);
				handleApiError(error, 'Profile Picture Update');
			} finally {
				hideLoading();
			}
		});
	};

	return (
		<>
			<BackHeader />
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 100 }]}>
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 100 }}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
					>
						<View style={{ alignItems: 'center' }}>
							<TouchableOpacity onPress={handleChangeProfilePic} style={{ position: 'relative' }}>
								{loading ? (
									<ShimmerPlaceHolder
										LinearGradient={LinearGradient}
										style={styles.avatar}
										shimmerStyle={{ borderRadius: 100 }}
										autoRun
									/>
								) : (
									<Image
										source={
											userData?.profile_pic
												? { uri: `${FILE_BASE_URL}/${userData.profile_pic}` }
												: userData?.avatar
													? { uri: userData.avatar }
													: {
														uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
															userData?.name || 'User'
														)}&background=random`,
													}
										}
										style={styles.avatar}
									/>
								)}
							</TouchableOpacity>

							{loading ? (
								<>
									<ShimmerPlaceHolder
										LinearGradient={LinearGradient}
										style={[styles.shimmerText, { width: '50%' }]}
										shimmerStyle={{ borderRadius: 10 }}
										autoRun
									/>
									<ShimmerPlaceHolder
										LinearGradient={LinearGradient}
										style={[styles.shimmerText, { width: '20%' }]}
										shimmerStyle={{ borderRadius: 10 }}
										autoRun
									/>
								</>
							) : (
								<>
									<CText
										fontSize={22}
										style={[globalStyles.fw_3, globalStyles.mt_4, { fontWeight: 'bold' }]}
									>
										{userData?.name || 'Unnamed User'}
									</CText>
									<CText fontSize={16} style={globalStyles.mt_4}>
										{userData?.email || 'No email'}
									</CText>
								</>
							)}
						</View>

						<View style={[globalStyles.cardRow, { margin: 10, justifyContent: 'center' }]}>
							{loading ? (
								<ShimmerPlaceHolder
									LinearGradient={LinearGradient}
									style={{ width: '40%', height: 40, borderRadius: 10 }}
									shimmerStyle={{ borderRadius: 10 }}
									autoRun
								/>
							) : (
								<TouchableOpacity
									style={[globalStyles.actionButton, { backgroundColor: theme.colors.light.danger }]}
									onPress={handleLogout}
								>
									<Icon name="log-out-outline" size={20} color="#fff" />
									<CText fontSize={16} style={{ marginLeft: 5, color: '#fff' }}>
										Logout
									</CText>
								</TouchableOpacity>
							)}
						</View>

						<HorizontalLine />

						<View style={globalStyles.p_3}>
							<View style={styles.rowSpaceBetween}>
								<CText fontSize={15} style={styles.label}>
									Academic Year:
								</CText>
								<View style={styles.acadContainer}>
									<TouchableOpacity onPress={() => navigation.navigate('AcademicYear')}>
										<Icon name="pencil" size={20} color={theme.colors.light.primary} />
									</TouchableOpacity>
									<CText fontSize={16} fontStyle="SB" style={{ marginLeft: 8 }}>
										{formatAcad(acad?.semester, acad?.from, acad?.to)}
									</CText>
								</View>
							</View>
						</View>

						{loading ? (
							<View style={[globalStyles.p_3, styles.rowSpaceBetween]}>
								<ShimmerPlaceHolder
									LinearGradient={LinearGradient}
									style={{ width: '60%', height: 30, borderRadius: 10 }}
									shimmerStyle={{ borderRadius: 10 }}
									autoRun
								/>
								<ShimmerPlaceHolder
									LinearGradient={LinearGradient}
									style={{ width: '60%', height: 30, borderRadius: 10 }}
									shimmerStyle={{ borderRadius: 10 }}
									autoRun
								/>
							</View>
						) : (
							<View style={globalStyles.p_3}>
								<View style={styles.rowSpaceBetween}>
									<CText fontSize={15} style={styles.label}>
										Roles:
									</CText>
									<View style={{ flexShrink: 1 }}>
										<CText fontSize={15} style={{ fontWeight: 'bold' }}>
											{roles?.map((r) => r.toUpperCase()).join(', ')}
										</CText>
									</View>
								</View>

								{isBiometricSupported && (
									<View style={styles.rowSpaceBetween}>
										<CText fontSize={15} style={styles.label}>
											Enable Biometric Login
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
											trackColor={{ false: '#767577', true: theme.colors.light.primary }}
											thumbColor={biometricEnabled ? theme.colors.light.primary : '#f4f3f4'}
										/>
									</View>
								)}
							</View>
						)}
					</ScrollView>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
}

const styles = StyleSheet.create({
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
