import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	View,
	StyleSheet,
	ScrollView, SafeAreaView, Platform, PermissionsAndroid, RefreshControl, Text, ActivityIndicator, TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../theme/styles.ts';
import { CText } from '../components/CText.tsx';
import { theme } from '../theme';
import messaging, {
	FirebaseMessagingTypes,
	getMessaging,
	getToken,
} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveFcmToken } from '../api/modules/userApi.ts';
import { handleApiError } from '../utils/errorHandler.ts';
import CustomHeader from '../components/CustomHeader.tsx';
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
const HomeScreen = ({navigation}) => {
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const [dash_data, setData] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const { can, hasRole } = useAccess();
	const getFCMToken = async () => {
		try {
			const app = getApp();
			const messaging = getMessaging(app);

			const token = await getToken(messaging);
			if (token) {
				await saveFcmToken(token);
				await AsyncStorage.setItem('FCM_TOKEN_KEY', token);
			}
		} catch (error) {
			// handleApiError(error, 'Get FCM Token');
		}
	};

	const getDashboardData = async () => {
		try {
			setLoading(true);

			if (network?.isOnline) {
				const res = await getDashData();
				setData(res);
			} else {

			}
		} catch (error) {
			// handleApiError(error, 'Fetch Dashboard Data');
		} finally {
			setLoading(false);
		}
	};


	useEffect(() => {
		getDashboardData();
	}, []);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		getDashboardData();
		setRefreshing(false);
	}, []);

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
			totalScans: dash_data?.total_scans || 0,
			todayScans: Array.isArray(dash_data?.scans) ? dash_data.scans.length : 0
		};


		const recentScans = dash_data?.scans || [];

		return (
			<>
				<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
					<View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16 }}>
					<SummaryCard
						title="Classes"
						loading={loading}
						formatNumber={formatNumber}
						CText={CText}
						stats={[
							{ label: '', value: stats.todayScans },
						]}
						backgroundColor="#fff"
						textColor="#37A954"
					/>
					<SummaryCard
						title="Total Scans"
						loading={loading}
						formatNumber={formatNumber}
						CText={CText}
						stats={[
							{ label: '', value: stats.totalScans },
						]}
						backgroundColor="#fff"
						textColor="#FFC107"
					/>
					</View>
				</ScrollView>
			</>
		);
	};


	return (
		<>
			<CustomHeader />
			<BackgroundWrapper>
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
					</ScrollView>
				</SafeAreaView>
			</BackgroundWrapper>
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
