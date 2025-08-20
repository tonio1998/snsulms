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
	Dimensions,
	StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from '../theme/styles';
import { CText } from '../components/common/CText';
import { theme } from '../theme';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveFcmToken } from '../api/modules/userApi';
import { handleApiError } from '../utils/errorHandler';
import { getApp } from '@react-native-firebase/app';
import { useAuth } from '../context/AuthContext';
import { getDashData } from '../api/modules/dashboardApi';
import { formatDate } from '../utils/dateFormatter';
import { useAccess } from '../hooks/useAccess';
import { formatNumber } from '../utils/format';
import { SummaryCard } from '../components/SummaryCard';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { NetworkContext } from '../context/NetworkContext';
import { useFocusEffect } from '@react-navigation/native';
import { getAcademicInfo } from '../utils/getAcademicInfo';
import CustomHomeHeader from '../components/layout/CustomHomeHeader.tsx';
import LinkScroll from "../components/LinkScroll.tsx";
import TextTicker from "react-native-text-ticker";
import {loadDashboardCache, saveDashboardCache} from "../utils/cache/dashboardCache.ts";
import ActivityIndicator2 from "../components/loaders/ActivityIndicator2.tsx";
import {isTablet} from "../utils/responsive";
import SNSULogoDraw from "../components/loaders/SNSULogo.tsx";
import SNSULoading from "../components/loaders/SNSULoading.tsx";
import {LastUpdatedBadge} from "../components/common/LastUpdatedBadge";

const HomeScreen = () => {
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { hasRole } = useAccess();

	const [dashData, setDashData] = useState<any>({});
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [acad, setAcad] = useState<string | null>(null);
	const [acadRaw, setAcadRaw] = useState<any>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [isCachedData, setIsCachedData] = useState(false);

	useFocusEffect(
		useCallback(() => {
			StatusBar.setBarStyle('light-content');
			StatusBar.setBackgroundColor('#1e1e1e');
			return () => {
				StatusBar.setBarStyle('dark-content');
				StatusBar.setBackgroundColor('#ffffff');
			};
		}, [])
	);

	useEffect(() => {
		const requestNotificationPermission = async () => {
			if (Platform.OS === 'android' && Platform.Version >= 33) {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
				);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
			}
			await getFCMToken();
		};
		requestNotificationPermission();
	}, []);

	const getFCMToken = async () => {
		try {
			const app = getApp();
			const messaging = getMessaging(app);
			const token = await getToken(messaging);
			const isGenerated = await AsyncStorage.getItem(`FCM_TOKEN_KEY_${user?.id}`);
			if (token && !isGenerated) {
				await saveFcmToken(token);
				await AsyncStorage.setItem(`FCM_TOKEN_KEY_${user?.id}`, token);
			}
		} catch (error) {
			handleApiError(error, 'Get FCM Token');
		}
	};

	const getDashboardLocal = async (acadStr: string) => {
		try {
			setLoading(true);
			const { data, date } = await loadDashboardCache(user?.id, acadStr);
			if (data) {
				setDashData(data);
				setLastUpdated(date);
				setIsCachedData(true);
			}
		} catch (err) {
			handleApiError(err, 'Fetch Dashboard Data');
		} finally {
			setLoading(false);
		}
	};

	const getDashboardData = async (acadStr: string, forceRefresh = false) => {
		try {
			setLoading(true);
			const filter = { AcademicYear: acadStr };
			const res = await getDashData(filter);
			setDashData(res);
			const savedDate = await saveDashboardCache(user?.id, acadStr, res);
			setLastUpdated(savedDate);
			setIsCachedData(false);
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
					await getDashboardLocal(acadStr);
				}
			};
			init();
			return () => { isActive = false; };
		}, [])
	);

	const onRefresh = useCallback(async () => {
		const acadInfo = acad ? acadRaw : await getAcademicInfo();
		const acadStr = acad ? acad : `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
		await getDashboardData(acadStr, true);
	}, [acad, acadRaw]);

	const renderStudentDashboard = () => {
		const stats = {
			incoming: dashData?.incoming_activities || 0,
			dueToday: dashData?.due_today || 0,
			completed: dashData?.completed_activities || 0,
			totalActivities: dashData?.total_activities || 0,
			totalClasses: dashData?.total_classes || 0,
		};
		const recentActivities = dashData?.recent_activities || [];

		return (
			<View style={{ marginTop: 10 }}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 16 }}>
						<SummaryCard
							title="Activities"
							loading={loading}
							formatNumber={formatNumber}
							CText={CText}
							stats={[
								{ label: 'Total', value: stats.totalActivities },
								{ label: 'Incoming', value: stats.incoming },
								{ label: 'Due Today', value: stats.dueToday },
								{ label: 'Completed', value: stats.completed },
							]}
							gradientColors={[theme.colors.light.primary, theme.colors.light.secondary]}
							textColor={theme.colors.light.card}
							cardStyle={[styles.summaryCardSmall, {width: Dimensions.get('window').width * 0.9}]}
						/>
						<SummaryCard
							title="Activities"
							loading={loading}
							formatNumber={formatNumber}
							CText={CText}
							stats={[
								{ label: 'Incoming', value: stats.incoming },
							]}
							gradientColors={[theme.colors.light.primary, '#fff']}
							textColor={theme.colors.light.card}
							cardStyle={styles.summaryCardSmall}
						/>
						<SummaryCard
							title="Classes"
							loading={loading}
							formatNumber={formatNumber}
							CText={CText}
							stats={[{ label: '', value: stats.totalClasses }]}
							gradientColors={[theme.colors.light.warning, '#fff']}
							textColor={theme.colors.light.text}
							cardStyle={styles.summaryCardSmall}
						/>
					</View>
				</ScrollView>

				<View style={styles.section}>
					<CText fontSize={18} fontStyle="B" style={styles.sectionTitle}>
						Recent Activities
					</CText>
					{loading ? (
						[...Array(3)].map((_, i) => (
							<ShimmerPlaceHolder
								key={i}
								LinearGradient={LinearGradient}
								style={styles.shimmerPlaceholder}
							/>
						))
					) : recentActivities.length === 0 ? (
						<NoData icon="school-outline" message="No recent activity yet." />
					) : (
						recentActivities.slice(0, 5).map((activity, index) => (
							<ActivityItem
								key={index}
								title={activity?.title}
								date={activity?.due_date}
								isDue={true}
							/>
						))
					)}
				</View>
			</View>
		);
	};

	const renderTeacherDashboard = () => {
		const stats = {
			classesHandled: dashData?.total_classes || 0,
			assignmentsToCheck: dashData?.pending_checks || 0,
			upcomingClasses: dashData?.upcoming_classes || 0,
			activities: dashData?.activities?.length || 0,
		};
		const recentSubmissions = dashData?.recent_submissions || [];

		return (
			<View>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 16 }}>
						<SummaryCard
							title="Classes"
							loading={loading}
							formatNumber={formatNumber}
							CText={CText}
							stats={[{ label: '', value: stats.classesHandled }]}
							gradientColors={[theme.colors.light.primary, theme.colors.light.secondary]}
							textColor={theme.colors.light.card}
							cardStyle={[styles.summaryCardSmall, {width: isTablet() ? Dimensions.get('window').width * -0.9 : Dimensions.get('window').width * 0.5}]}
						/>
						<SummaryCard
							title="Activities"
							loading={loading}
							formatNumber={formatNumber}
							CText={CText}
							stats={[{ label: '', value: stats.activities }]}
							gradientColors={[theme.colors.light.warning, theme.colors.light.warning_soft]}
							textColor={theme.colors.light.text}
							cardStyle={[styles.summaryCardSmall, {width: isTablet() ? Dimensions.get('window').width * -0.9 : Dimensions.get('window').width * 0.5}]}
						/>
					</View>
				</ScrollView>

				<View style={styles.section}>
					<CText fontSize={17} fontStyle="SB" style={styles.sectionTitle}>
						Recent Submissions
					</CText>
					{loading ? (
						[...Array(3)].map((_, i) => (
							<ShimmerPlaceHolder
								key={i}
								LinearGradient={LinearGradient}
								style={styles.shimmerPlaceholder}
							/>
						))
					) : recentSubmissions.length === 0 ? (
						<NoData icon="document-text-outline" message="No recent submissions yet." />
					) : (
						recentSubmissions.slice(0, 5).map((submission, index) => (
							<ActivityItem
								key={index}
								title={submission?.title}
								date={submission?.created_at}
								student={submission?.student}
								isDue={false}
							/>
						))
					)}
				</View>
			</View>
		);
	};

	const buttons = [
		// { url: 'org.nativescript.snsu://', fallbackUrl: 'https://play.google.com/store/apps/details?id=org.nativescript.snsu', iconSet: 'Ionicons', iconName: 'link-outline', name: 'SNSU' },
		{ url: 'https://www.snsu.edu.ph/', iconSet: 'Ionicons', iconName: 'globe-outline', name: 'Website' },
		{ url: 'https://www.youtube.com/@snsuofficialchannel5179', fallbackUrl: 'https://www.youtube.com/@snsuofficialchannel5179',iconSet: 'FontAwesome', iconName: 'youtube', name: 'YouTube' },
		{ url: 'https://www.facebook.com/SNSUOfficial', iconSet: 'FontAwesome', iconName: 'facebook', name: 'Facebook' },
		{ url: 'fb-messenger://user/', iconSet: 'Ionicons', iconName: 'chatbubble-ellipses-outline', name: 'Messenger' },
		// { url: 'worklinker://', fallbackUrl: 'https://worklinker.snsu.edu.ph/', iconSet: 'Ionicons', iconName: 'link-outline', name: 'Worklinker' },
	];

	return (
		<>
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 0}]}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 100 }}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
				>
					<CustomHomeHeader />
					<Text>{'\n\n\n\n\n'}</Text>
					<View style={{ marginHorizontal: 0}}>
						<View style={styles.welcomeContainer}>
							<LastUpdatedBadge
								date={lastUpdated}
								onReload={onRefresh}
							/>
							<View>
								<LinkScroll buttons={buttons} />
								{loading && (
									<>
										<ActivityIndicator2 />
									</>
								)}
							</View>
							<TextTicker
								style={{ fontSize: 18, color: theme.colors.light.primary, fontWeight: 'semibold' }}
								duration={12000}
								loop
								bounce={false}
								repeatSpacer={50}
								marqueeDelay={2000}
							>
								Welcome to SNSU! 🚨 Announcement: Start of Class for the AY 2025-2026 is on August 18th! Don’t miss it!
							</TextTicker>
						</View>

						{hasRole('STUD') && renderStudentDashboard()}
						{hasRole('ACAD') && renderTeacherDashboard()}
					</View>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const NoData = ({ icon, message }: { icon: string; message: string }) => (
	<View style={styles.noDataContainer}>
		<View style={styles.noDataIconWrapper}>
			<Icon name={icon} size={40} color={theme.colors.light.primary} />
		</View>
		<CText style={styles.noDataText}>{message}</CText>
	</View>
);

const ActivityItem = ({ title, date, student, isDue }: any) => (
	<View style={styles.updateItem}>
		<View style={styles.iconCircle}>
			<Icon name="document-text-outline" size={22} color={theme.colors.light.primary} />
		</View>
		<View style={styles.updateText}>
			{student && <Text style={styles.updateLabel}>{student}</Text>}
			<Text style={styles.updateTitle} numberOfLines={1}>
				Activity: {title || 'Untitled'}
			</Text>
			{date && (
				<Text style={styles.updateDate}>
					{isDue ? 'Due: ' : 'Submitted on '}
					{formatDate(date, 'MMM dd, yyyy')}
				</Text>
			)}
		</View>
	</View>
);

const styles = StyleSheet.create({
	welcomeContainer: {
		paddingHorizontal: 16,
		marginTop: 25,
		marginBottom: 10,
		backgroundColor: theme.colors.light.background,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20
	},
	updatedBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.light.card + '19',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 50,
		alignSelf: 'flex-start',
		marginTop: 4,
	},
	updatedText: {
		fontSize: 12,
		color: theme.colors.light.text,
	},
	noDataContainer: {
		alignItems: 'center',
		padding: 16,
		borderRadius: 8,
		marginTop: 16,
	},
	noDataIconWrapper: {
		backgroundColor: theme.colors.light.primary + '22',
		padding: 12,
		borderRadius: 50,
	},
	noDataText: {
		color: '#777',
		marginTop: 10,
		textAlign: 'center',
		fontSize: 14,
	},
	updateItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 5,
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.light.primary + '22',
		alignItems: 'center',
		justifyContent: 'center',
	},
	updateText: {
		flex: 1,
		marginLeft: 12,
	},
	updateLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
	},
	updateTitle: {
		fontSize: 14,
		color: '#444',
		fontWeight: '500',
	},
	updateDate: {
		fontSize: 12,
		color: '#777',
		marginTop: 2,
	},
	summaryCard: {
		width: Dimensions.get('window').width * 1.1,
		padding: 20,
		borderRadius: 8,
	},
	summaryCardSmall: {
		width: Dimensions.get('window').width * 0.60,
		borderRadius: 8,
	},
	section: {
		marginTop: 30,
		paddingHorizontal: 16,
	},
	sectionTitle: {
		marginBottom: 10,
	},
	shimmerPlaceholder: {
		height: 70,
		width: Dimensions.get('window').width * 0.9,
		borderRadius: 8,
		marginBottom: 12,
	},
});

export default HomeScreen;
