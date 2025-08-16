import React, { useCallback, useContext, useEffect, useRef, useState, useMemo } from 'react';
import {
	View,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	ScrollView,
	Modal,
	Animated,
	Easing,
	Dimensions,
	ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { useFocusEffect } from '@react-navigation/native';
import { CText } from '../../../../components/common/CText.tsx';
import { formatDate } from '../../../../utils/dateFormatter';
import BackHeader from '../../../../components/layout/BackHeader.tsx';
import { NetworkContext } from '../../../../context/NetworkContext.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import { useClass } from '../../../../context/SharedClassContext.tsx';
import { useLoading2 } from '../../../../context/Loading2Context.tsx';
import ProgressBar from "../../../../components/common/ProgressBar.tsx";
import ActivityIndicator2 from "../../../../components/loaders/ActivityIndicator2.tsx";
import FabMenu from "../../../../components/buttons/FabMenu.tsx";

const { height } = Dimensions.get('window');

const ActivityCard = React.memo(({ item, onPress }) => (
	<TouchableOpacity style={styles.card} onPress={() => onPress(item.Title, item.ActivityID)} activeOpacity={0.5}>
		<View style={styles.cardInner}>
			<CText fontSize={17} fontStyle="SB" style={styles.cardTitle}>{item?.Title}</CText>
			{item?.Description?.trim() !== '' && (
				<CText fontSize={14} style={styles.cardDesc} numberOfLines={2}>{item?.Description}</CText>
			)}
			<ProgressBar percent={item?.CompletedPercent || 0} />
			<View style={styles.cardFooter}>
				{item?.DueDate && (
					<CText fontSize={12} style={styles.cardMeta}>Due: {formatDate(item?.DueDate)}</CText>
				)}
				<CText fontSize={12} style={styles.cardMeta}>Created: {formatDate(item?.created_at, 'relative')}</CText>
			</View>
		</View>
	</TouchableOpacity>
));

const ActivityScreen = ({ navigation }) => {
	const { classes, refresh } = useClass();
	const ClassID = classes?.ClassID;

	const network = useContext(NetworkContext);
	const { showLoading2, hideLoading2 } = useLoading2();

	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [actType, setActType] = useState('');
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(height)).current;

	const activityTypes = useMemo(() => [
		{ label: 'All', value: '' },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz/Exam', value: 3 },
	], []);

	const fetchActivities = useCallback(async () => {
		setLoading(true);
		try {
			// showLoading2('Loading activities...');
			const res = classes?.activities || [];
			const enriched = res.map(item => {
				const total = item.student_activity?.length || 0;
				const submitted = item.student_activity?.filter(stu => stu.DateSubmitted)?.length || 0;
				return { ...item, CompletedPercent: total ? Math.round((submitted / total) * 100) : 0 };
			});
			setActivities(enriched);
		} catch (err) {
			handleApiError(err, 'Failed to fetch activities');
		} finally {
			setLoading(false);
			// hideLoading2();
		}
	}, [classes?.activities, loading, network?.isOnline, showLoading2, hideLoading2]);

	useFocusEffect(useCallback(() => {
		fetchActivities();
		console.log("🔍 Fetching activities from API", ClassID);
	}, [fetchActivities]));

	const filteredActivities = useMemo(() => {
		if (!actType) return activities;
		return activities.filter(act => act.ActivityTypeID == actType);
	}, [activities, actType]);

	const handleRefresh = async () => {
		refresh();
		await fetchActivities();
	};

	const handleViewAct = (Title, ActivityID) => navigation.navigate('FacActivityDetails', { Title, ActivityID });

	const openModal = () => {
		setShowModal(true);
		Animated.timing(slideAnim, { toValue: 0, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
	};

	const closeModal = () => {
		Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }).start(() => setShowModal(false));
	};

	const handleOption = type => {
		closeModal();
		if (type === '2') navigation.navigate('AddActivity', {
			ClassID,
			ActivityTypeID: type,
			ClassInfo: classes,
			onAdded: fetchActivities
		});
		if (type === '3') navigation.navigate('QuizBuilder', {
			ClassID,
			ActivityTypeID: type,
			ClassInfo: classes,
			onAdded: fetchActivities
		});
		if (type === '4') navigation.navigate('OutlineList', { ClassID });
	};

	const renderFilterHeader = () => (
		<>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 14 }}>
				<View style={{ flexDirection: 'row', gap: 10 }}>
					{activityTypes.map((type, idx) => {
						const isActive = actType === type.value;
						return (
							<TouchableOpacity
								key={idx}
								onPress={() => setActType(type.value)}
								style={[styles.filterBtn, isActive && styles.activeFilterBtn]}
							>
								<CText style={{ color: isActive ? '#fff' : '#111', fontSize: 13 }} fontStyle="SB">{type.label}</CText>
							</TouchableOpacity>
						);
					})}
				</View>
			</ScrollView>
			<View>
				{loading && (
					<>
						<ActivityIndicator2 />
					</>
				)}
			</View>
		</>
	);

	return (
		<>
			<BackHeader title="Activities" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 100 }]}>
				<FlatList
					data={filteredActivities}
					keyExtractor={item => item.ActivityID.toString()}
					renderItem={({ item }) => <ActivityCard item={item} onPress={handleViewAct} />}
					ListHeaderComponent={renderFilterHeader}
					contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					initialNumToRender={5}
					maxToRenderPerBatch={5}
					removeClippedSubviews
					ListEmptyComponent={!loading && (
						<View style={{ padding: 20, alignItems: 'center' }}>
							<Icon name="list-circle-outline" size={48} color="#ccc" />
							<CText fontSize={14} style={{ color: '#888', marginTop: 10 }}>No activities found</CText>
						</View>
					)}
				/>

				<FabMenu
					fabColor={theme.colors.light.primary}
					fabIcon="add"
					iconColor="#fff"
					iconSize={28}
					radius={80}
					startAngle={200}
					spacingAngle={60}
					fabSize={55}
					options={[
						{
							label: "Assignment",
							color: theme.colors.light.primary,
							icon: "document-text",
							onPress: () => handleOption("2"),
						},
						{
							label: "Quiz/Exam",
							color: theme.colors.light.primary,
							icon: "clipboard",
							onPress: () => handleOption("3"),
						},
					]}

				/>



			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'transparent', // no dark dim
	},
	modalContainerNearFab: {
		position: 'absolute',
		right: 20, // adjust to match FAB horizontal position
		bottom: 90, // pop above FAB height
		alignItems: 'center',
		gap: 10,
	},
	option: {
		height: 60,
		width: 120,
		borderRadius: 10,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 4,
	},
	circleOption: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: '#4a90e2',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 6,
	},
	card: { backgroundColor: '#fff', borderRadius: theme.radius.md, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
	cardInner: {},
	cardTitle: { fontSize: 17, color: '#111', marginBottom: 6 },
	cardDesc: { fontSize: 14, color: '#555', lineHeight: 20 },
	cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
	cardMeta: { fontSize: 12, color: '#888' },
	filterBtn: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, backgroundColor: '#f3f4f6' },
	activeFilterBtn: { backgroundColor: theme.colors.light.primary },
	fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: theme.colors.light.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 5 },
});

export default ActivityScreen;
