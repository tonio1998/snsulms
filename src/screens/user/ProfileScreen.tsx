import React, { useCallback, useContext, useEffect, useState } from 'react';
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
	Text, ActivityIndicator, Linking, ToastAndroid
} from 'react-native';
import { useAuth } from '../../context/AuthContext.tsx';
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { globalStyles } from '../../theme/styles.ts';
import { CText } from '../../components/CText.tsx';
import { useAlert } from '../../components/CAlert.tsx';
import CButton from '../../components/CButton.tsx';
import { getUserDetails, updateProfilePicture } from '../../api/modules/userApi.ts';
import { viewFile } from '../../utils/viewFile.ts';
import { getAddressFromCoords, getFileSize } from '../../utils/format.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import GroupedFileList from '../../components/GroupedFileList.tsx';
import { FILE_BASE_URL } from '../../api/api_configuration.ts';
import HorizontalLine from '../../components/HorizontalLine.tsx';
import { formatDate } from '../../utils/dateFormatter';
import { captureAndSaveLocation } from '../../services/locationService.ts';
import { useLoading } from '../../context/LoadingContext.tsx';
import { fetchUserProfileComplete } from '../../utils/ProfileScreen';
import StarRating from '../../components/StarRating.tsx';
import CustomHeader from '../../components/CustomHeader.tsx';
import BackgroundWrapper from '../../utils/BackgroundWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackHeader from '../../components/BackHeader.tsx';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import * as net from 'node:net';
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

function getAge(dob: string | undefined): string {
	if (!dob) return '';
	const relative = formatDate(dob, 'relative');
	return relative.replace(/\sago$/, ' old');
}

export default function ProfileScreen({ navigation }) {
	const network = useContext(NetworkContext);
	const { showAlert } = useAlert();
	const { showLoading, hideLoading } = useLoading();
	const [refreshing, setRefreshing] = useState(false);
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [address, setAddress] = useState('');
	const [profileCount, setProfile] = useState(null);
	const [roles, useRoles] = useState();

	const {
		isBiometricSupported,
		biometricEnabled,
		enableBiometricLogin,
		disableBiometricLogin,
		user,
		logout,
	} = useAuth();

	const fetchUserData = async () => {
		// showLoading();
		setLoading(true)
		try {
			const sdsdd = await AsyncStorage.getItem('roles');
			const roles = JSON.parse(sdsdd);
			useRoles(roles);
			if (network?.isOnline) {
				const res = await getUserDetails(user?.id);
				const userRoles = res?.roles || [];
				await AsyncStorage.setItem('user_data_'+user?.id, JSON.stringify(res));
				setUserData(res);
			} else {
				const cachedData = await AsyncStorage.getItem('user_data_'+user?.id);
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
			// hideLoading();
			setLoading(false)
		}
	};
	
	useEffect(() => {
		fetchUserData();
	}, []);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchUserData();
		setRefreshing(false);
	}, []);
	
	const handleLogout = async () => {
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
			if (!asset || !asset.uri) {
				Alert.alert('Error', 'No image selected');
				return;
			}

			showLoading('Uploading..')

			try {
				await updateProfilePicture(user.id, asset);
				await fetchUserData();
				showAlert('success', 'Success', 'Profile picture updated!');
			} catch (error) {
				console.error(error);
				handleApiError(error, "sdsd")
			} finally{
				hideLoading();
			}
		});
	};

	return (
		<>
			<BackHeader />
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 100}]}>
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 100 }}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
					>
						<View style={{ alignItems: 'center', }}>
							<View style={{ position: 'relative' }}>
								<TouchableOpacity onPress={handleChangeProfilePic}>
									{loading ? (
										<ShimmerPlaceHolder
											LinearGradient={LinearGradient}
											style={{
												width: 150,
												height: 150,
												borderRadius: 100,
										}}
											shimmerStyle={{ borderRadius: 4 }}
											autoRun
										/>
									) : (
										<Image
											source={
												userData?.profile_pic
													? { uri: `${FILE_BASE_URL}/${userData.profile_pic}` }
													: userData?.avatar
														? { uri: userData.avatar } // Google avatar
														: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&background=random` } // Auto-gen avatar
											}
											style={styles.avatar}
										/>
									)}
								</TouchableOpacity>
								{/*<TouchableOpacity*/}
								{/*	onPress={() => navigation.navigate('EditProfile')}*/}
								{/*	style={{*/}
								{/*		position: 'absolute',*/}
								{/*		bottom: 0,*/}
								{/*		right: 0,*/}
								{/*		backgroundColor: '#fff',*/}
								{/*		borderRadius: 999,*/}
								{/*		padding: 6,*/}
								{/*		elevation: 4,*/}
								{/*	}}*/}
								{/*>*/}
								{/*	<Icon name="pencil" size={16} color="#000" />*/}
								{/*</TouchableOpacity>*/}
							</View>

							{loading ? (
								<>
									<ShimmerPlaceHolder
										LinearGradient={LinearGradient}
										style={{
											width: '50%',
											height: 20,
											borderRadius: 10,
											marginBottom: 10,
											marginTop: 10
										}}
										shimmerStyle={{ borderRadius: 4 }}
										autoRun
									/>
									<ShimmerPlaceHolder
										LinearGradient={LinearGradient}
										style={{
											width: '20%',
											height: 20,
											borderRadius: 10,
										}}
										shimmerStyle={{ borderRadius: 4 }}
										autoRun
									/>
								</>
							) : (
								<>
									<CText fontSize={22} style={[globalStyles.fw_3, globalStyles.mt_4, { fontWeight: 'bold' }]}>
										{userData?.name || 'Unnamed User'}
									</CText>
									<CText fontSize={16} style={globalStyles.mt_4}>
										{userData?.email || 'No email'}
									</CText>
								</>
							)}
						</View>

						<View style={[globalStyles.cardRow, {margin: 10, flexDirection: 'center'}]}>
						{loading ? (
							<>
								<ShimmerPlaceHolder
									LinearGradient={LinearGradient}
									style={{
										width: '40%',
										height: 40,
										borderRadius: 10,
									}}
									shimmerStyle={{ borderRadius: 4 }}
									autoRun
								/>
							</>
							) : (
								<>

										<TouchableOpacity
											style={[globalStyles.actionButton, { backgroundColor: theme.colors.light.danger }]}
											onPress={handleLogout}
										>
											<Icon name="log-out-outline" size={20} color="#fff" />
											<CText fontSize={16} style={{ marginLeft: 5, color: '#fff' }}>Logout</CText>
										</TouchableOpacity>
										{/*<TouchableOpacity*/}
										{/*	style={[globalStyles.actionButton, { backgroundColor: theme.colors.light.muted, elevation: 0 }]}*/}
										{/*	onPress={() => navigation.navigate('ChangePassword')}*/}
										{/*>*/}
										{/*	<Icon name="key-outline" size={20} color="#000" />*/}
										{/*	<CText fontSize={16} style={{ marginLeft: 5, color: '#000' }}>Change Password</CText>*/}
										{/*</TouchableOpacity>*/}
								</>
						)}
						</View>

						<HorizontalLine/>

						<View style={globalStyles.p_3}>
							<View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
								<CText
									fontSize={15}
									style={{
										fontWeight: 'bold',
										color: '#333',
										marginRight: 8,
										width: '50%',
									}}
								>
									Academic Year:
								</CText>

								<CButton title={'Set'} type={'success'} onPress={() => navigation.navigate('AcademicYear')} />
							</View>
						</View>

						{loading ? (
							<>
							<View style={globalStyles.p_3}>
								<View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
									<View>
										<ShimmerPlaceHolder
											LinearGradient={LinearGradient}
											style={{
												width: '60%',
												height: 30,
												borderRadius: 10,
											}}
											shimmerStyle={{ borderRadius: 4 }}
											autoRun
										/>
									</View>
									<View>
										<ShimmerPlaceHolder
											LinearGradient={LinearGradient}
											style={{
												width: '60%',
												height: 30,
												borderRadius: 10,
											}}
											shimmerStyle={{ borderRadius: 4 }}
											autoRun
										/>
									</View>
								</View>
							</View>
							</>
						) : (
							<>
								<View style={globalStyles.p_3}>
									<View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
										<CText
											fontSize={15}
											style={{
												fontWeight: 'bold',
												color: '#333',
												marginRight: 8,
												width: '50%',
											}}
										>
											Roles:
										</CText>

										<CText
											fontSize={15}
											style={{
												fontWeight: 'bold',
												flexShrink: 1,
											}}
										>
											{roles?.map(role => role.toUpperCase()).join(', ')}
										</CText>
									</View>

									{isBiometricSupported && (
										<View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
											<CText
												fontSize={15}
												style={{
													fontWeight: 'bold',
													color: '#333',
												}}
											>
												Enable Biometric Login
											</CText>
											<Switch
												value={biometricEnabled}
												onValueChange={async (val) => {
													try {
														if (val) {
															await enableBiometricLogin();
														} else {
															await disableBiometricLogin();
														}
													} catch (e) {
														ToastAndroid.show('Failed to update biometric settings.', ToastAndroid.SHORT);
													}
												}}
												trackColor={{ false: '#767577', true: theme.colors.light.primary }}
												thumbColor={biometricEnabled ? theme.colors.light.primary : '#f4f3f4'}
											/>
										</View>
									)}

								</View>
							</>
						)}


					</ScrollView>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		paddingHorizontal: 20,
		paddingVertical: 30,
		justifyContent: 'flex-start',
		flexGrow: 1,
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 2,
		borderColor: theme.colors.light.primary,
	},
	biometricRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 30,
	},
	biometricText: {
		flex: 1,
		fontSize: 16,
		color: '#222',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 30,
		marginBottom: 20,
	},
	addBtn: {
		padding: 3,
		paddingHorizontal: 5,
		borderRadius: 5,
	},
	logoutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.light.danger,
		paddingVertical: 8,
		paddingHorizontal: 28,
		borderRadius: 8,
		shadowColor: theme.colors.light.primary + '55',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.8,
		shadowRadius: 6,
		elevation: 6,
	},
	icon: {
		marginRight: 8,
	},
	logoutText: {
		color: '#fff',
		fontWeight: 'bold',
	},
});
