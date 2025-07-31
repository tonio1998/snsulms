import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	Platform,
	PermissionsAndroid,
	RefreshControl,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	Dimensions, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../theme/styles.ts';
import { CText } from '../components/common/CText.tsx';
import { theme } from '../theme';
import messaging, {
	FirebaseMessagingTypes,
	getMessaging,
	getToken,
} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveFcmToken } from '../api/modules/userApi.ts';
import { handleApiError } from '../utils/errorHandler.ts';
import CustomHeader from '../components/layout/CustomHeader.tsx';
import BackgroundWrapper from '../utils/BackgroundWrapper';
import { getApp } from '@react-native-firebase/app';
import { useAuth } from '../context/AuthContext.tsx';
import { getDashData } from '../api/modules/dashboardApi.ts';
import { formatDate } from '../utils/dateFormatter';
import { useAccess } from '../hooks/useAccess.ts';
import { formatNumber } from '../utils/format.ts';
import { SummaryCard } from '../components/SummaryCard.tsx';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { NetworkContext } from '../context/NetworkContext.tsx';
import { getOfflineDashboard, saveDashboardData } from '../utils/sqlite/offlinedashboard';
import {useFocusEffect} from "@react-navigation/native";
import {getAcademicInfo} from "../utils/getAcademicInfo.ts";
const HomeScreen = ({navigation}) => {
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const [dash_data, setData] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const { can, hasRole } = useAccess();
	const window = Dimensions.get('window');
	const [acad, setAcad] = useState(null);
	const [acadRaw, setAcadRaw] = useState(null);

	const getFCMToken = async () => {
		try {
			const app = getApp();
			const messaging = getMessaging(app);
			const token = await getToken(messaging);

			const isGenerated = await AsyncStorage.getItem('FCM_TOKEN_KEY');
			// console.log('isGenerated ', isGenerated);
			if (token && !isGenerated) {
				console.log('FCM Token already generated');
				await saveFcmToken(token);
				await AsyncStorage.setItem('FCM_TOKEN_KEY', token);
			}
		} catch (error) {
			handleApiError(error, 'Get FCM Token');
		}
	};

	const getDashboardData = async (acadStr: string) => {
		try {
			setLoading(true);
			if (network?.isOnline) {
				const filter = {
					AcademicYear: acadStr,
				};
				const res = await getDashData(filter);
				setData(res);
			} else {
			}
		} catch (error) {
			handleApiError(error, 'Fetch Dashboard Data');
		} finally {
			setLoading(false);
		}
	};



	useFocusEffect(
		useCallback(() => {
			let isActive = true;
			const init = async () => {
				const acadInfo = await getAcademicInfo();
				const acadStr = `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
				if (isActive) {
					setAcad(acadStr);
					setAcadRaw(acadInfo);
					await getDashboardData(acadStr);
				}
			};
			init();

			return () => {
				isActive = false;
			};
		}, [])
	);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		if (!acad) {
			const acadInfo = await getAcademicInfo();
			const acadStr = `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
			setAcad(acadStr);
			setAcadRaw(acadInfo);
			await getDashboardData(acadStr);
		} else {
			await getDashboardData(acad);
		}
		setRefreshing(false);
	}, [acad]);


	useEffect(() => {
		const requestNotificationPermission = async () => {
			if (Platform.OS === 'android' && Platform.Version >= 33) {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
				);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
					return;
				}
			}
			await getFCMToken();
		};

		requestNotificationPermission();
	}, []);


	const renderStudentDashboard = () => {
		const stats = {
			totalSubjects: dash_data?.total_classes || 0,
			totalActivities: dash_data?.total_activities || 0,
			dueToday: dash_data?.due_today || 0,
			incoming: dash_data?.incoming_activities || 0,
			completed: dash_data?.completed_activities || 0,
			due: dash_data?.due_activities || 0,
		};


		const recentActivities = dash_data?.recent_activities || [];

		return (
			<View style={{ marginTop: 10 }}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 16 }}>
						<SummaryCard
							title="Incoming"
							loading={loading}
							formatNumber={formatNumber}
							CText={CText}
							stats={[{ label: '', value: stats.incoming }]}
							backgroundColor="#fff"
							textColor={theme.colors.light.primary}
							cardStyle={{
								width: window.width * 0.75,
								padding: 20,
								borderRadius: 8,
							}}
						/>

						<SummaryCard
							title="Due"
							loading={loading}
							formatNumber={formatNumber}
							CText={CText}
							stats={[{ label: '', value: stats.dueToday }]}
							backgroundColor="#fff"
							textColor={theme.colors.light.primary}
							cardStyle={{
								width: window.width * 0.75,
								padding: 20,
								borderRadius: 8,
							}}
						/>

						<SummaryCard
							title="Completed"
							loading={loading}
							formatNumber={formatNumber}
							CText={CText}
							stats={[{ label: '', value: stats.completed }]}
							backgroundColor="#fff"
							textColor={theme.colors.light.primary}
							cardStyle={{
								width: window.width * 0.2,
								padding: 20,
								borderRadius: 8,
							}}
						/>
					</View>
				</ScrollView>


				<View style={{ marginTop: 30, paddingHorizontal: 16 }}>
					<CText fontSize={18} fontStyle={'B'} style={{ marginBottom: 10 }}>
						Recent Activities
					</CText>

					{loading ? (
						[...Array(3)].map((_, i) => (
							<ShimmerPlaceHolder
								key={i}
								LinearGradient={LinearGradient}
								style={{
									height: 70,
									borderRadius: 16,
									marginBottom: 12,
								}}
							/>
						))
					) : recentActivities.length === 0 ? (
						<View style={{ alignItems: 'center', marginTop: 20 }}>
							<Icon name="school-outline" size={48} color="#bbb" />
							<CText style={{ color: '#888', marginTop: 10 }}>
								No recent activity yet.
							</CText>
						</View>
					) : (
						recentActivities.slice(0, 5).map((activity, index) => (
							<View key={index} style={styles.updateItem}>
								<View style={styles.iconCircle}>
									<Icon name="document-text-outline" size={22} color={theme.colors.light.primary} />
								</View>
								<View style={styles.updateText}>
									<Text style={styles.updateLabel}>{activity?.title || 'Untitled Activity'}</Text>
									{activity?.due_date && (
										<Text style={styles.updateDate}>
											Due: {formatDate(activity?.due_date || '', 'MMM dd, yyyy')}
										</Text>
									)}
								</View>
							</View>
						))
					)}
				</View>
			</View>
		);
	};




	return (
		<>
			<CustomHeader />
				<SafeAreaView style={[globalStyles.safeArea]}>
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 100 }}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
					>
						<View style={globalStyles.p_3}>
							<CText fontSize={18} fontStyle={'B'}>Welcome, {user?.name || ''}</CText>
						</View>
						{hasRole('STUD') && renderStudentDashboard()}
						{hasRole('ACAD') && renderStudentDashboard()}
					</ScrollView>
				</SafeAreaView>
		</>
	);

};

const styles = StyleSheet.create({
	cardBoardStyle: {
		width: 200,
		padding: 20,
		// marginBottom: 16,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 4,
		// elevation: 3,
		margin: 5
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	earningText: {
		fontSize: 28,
		fontWeight: '700',
		color: '#111',
	},
	earningSub: {
		fontSize: 13,
		color: '#777',
		marginTop: 4,
	},
	circleContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		borderWidth: 2,
		borderColor: '#e53935',
		alignItems: 'center',
		justifyContent: 'center',
	},
	percentChange: {
		color: '#e53935',
		fontWeight: '600',
	},
	statCard: {
		flex: 1,
		padding: 16,
		borderRadius: 16,
		backgroundColor: '#f0f0f0',
		marginBottom: 16,
	},
	statValue: {
		fontSize: 25,
		fontWeight: 900,
		color: '#fff',
	},
	statLabel: {
		fontSize: 14,
		color: '#fff',
		marginTop: 4,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		marginBottom: 16,
		color: '#333',
	},
	updateItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.light.background,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#ddd',
		padding: 16,
		marginBottom: 12,
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.light.primary_soft +'55',
		alignItems: 'center',
		justifyContent: 'center',
	},
	updateText: {
		flex: 1,
		marginLeft: 12,
	},
	updateLabel: {
		fontSize: 15,
		fontWeight: '600',
		color: '#333',
	},
	updateDate: {
		fontSize: 12,
		color: '#777',
		marginTop: 2,
	},
	updateAmount: {
		fontSize: 16,
		fontWeight: '700',
		color: '#4caf50',
	},
});

export default HomeScreen;
