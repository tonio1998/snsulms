import React, { useEffect, useState } from 'react';
import {
	View, FlatList, RefreshControl, SafeAreaView,
	ScrollView, TouchableOpacity, StyleSheet, Text,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { CText } from '../../../components/common/CText.tsx';
import {getActivities, getStudentActivities} from '../../../api/modules/activitiesApi.ts';
import { formatDate } from '../../../utils/dateFormatter';
import BackHeader from '../../../components/layout/BackHeader.tsx';
import Icon from "react-native-vector-icons/Ionicons";
import {
	loadStudentClassActivitiesCache,
	saveStudentClassActivitiesCache
} from "../../../utils/cache/Student/localstudentActivitiesCache.ts";
import {useAuth} from "../../../context/AuthContext.tsx";
import {LastUpdatedBadge} from "../../../components/common/LastUpdatedBadge";
import ActivityIndicator2 from "../../../components/loaders/ActivityIndicator2.tsx";
import {handleApiError} from "../../../utils/errorHandler.ts";

const ActivityScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const { user } = useAuth();
	const [allActivities, setAllActivities] = useState([]);
	const [activities, setActivities] = useState([]);
	const [actType, setActType] = useState('');
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [expandedId, setExpandedId] = useState(null);
	const { showLoading, hideLoading } = useLoading();
	const [lastFetched, setLastFetched] = useState(null);

	const types = [
		{ label: 'All', value: '' },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz/Exam', value: 3 },
	];

	const filterActivities = (type, list = allActivities) => {
		setActType(type);
		const filtered = list.filter(i => i.activity?.ActivityTypeID !== 1);
		setActivities(type ? filtered.filter(i => i.activity?.ActivityTypeID == type) : filtered);
		setExpandedId(null);
	};

	const fetchActivities = async () => {
		if (loading || !ClassID) return;
		try {
			setLoading(true);
			const res = await getStudentActivities({ page: 1, search: '', ClassID });
			const list = res?.data ?? [];

			setAllActivities(list);
			filterActivities(actType, list);

			const date = await saveStudentClassActivitiesCache(ClassID, user?.id, list);
			if (date) setLastFetched(date);
		} catch (err) {
			console.error('❌ Error loading activities:', err);
			handleApiError(err, 'Unable to load activities');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};


	const loadCachedActivities = async () => {
		if (!ClassID) return;
		try {
			const { data, date } = await loadStudentClassActivitiesCache(ClassID, user?.id);
			if (data && data.length > 0) {
				setAllActivities(data);
				filterActivities(actType, data);
			}

			if (date) setLastFetched(date);
		} catch (err) {
			console.error('Error loading cached activities:', err);
			fetchActivities();
		}
	};

	useEffect(() => {
		loadCachedActivities();
	}, [ClassID]);

	const handleRefresh = async () => {
		setLoading(true);
		await fetchActivities();
		setLoading(false);
	};

	const toggleExpand = (id) => {
		setExpandedId(prev => (prev === id ? null : id));
	};

	const handleView = (id, title, actId, ActivityTypeID) => {
		navigation.navigate('ActivityDetails', {
			StudentActivityID: id,
			Title: title,
			ActivityID: actId,
			ActivityTypeID:ActivityTypeID
		});
	};

	const renderItem = ({ item }) => {
		const act = item.activity;
		const isExpanded = expandedId === item.StudentActivityID;
		const submitted = item?.SubmissionType === 'Submitted';
		const submissionText = item?.SubmissionType ?? 'Not Submitted';
		const submittedDate = item?.DateSubmitted ? ` • ${formatDate(item.DateSubmitted)}` : '';

		return (
			<TouchableOpacity
				style={globalStyles.card}
				onPress={() => toggleExpand(item.StudentActivityID)}
				activeOpacity={0.9}
			>
				<View style={styles.cardInner}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<CText fontSize={theme.fontSizes.md} fontStyle="SB">{act?.Title}</CText>
						<View>
							{submitted && (
								<Icon name="checkmark-circle" size={22} color={theme.colors.light.success} />
							)}
						</View>
					</View>
					<CText fontSize={theme.fontSizes.sm} style={styles.desc}>{act?.Description}</CText>
					{isExpanded && (
						<>
							<View style={[styles.dateRow, { marginTop: 6 }]}>
								<CText fontSize={theme.fontSizes.xs} fontStyle={'SB'} style={{ color: submitted ? theme.colors.light.success : theme.colors.light.danger }}>
									{submissionText}{submittedDate}
								</CText>
							</View>
							<View style={styles.dateRow}>
								{act?.DueDate && <CText fontSize={theme.fontSizes.xs} style={styles.date}>Due: {formatDate(act?.DueDate)}</CText>}
								{act?.created_at && <CText fontSize={theme.fontSizes.xs} style={styles.date}>Created: {formatDate(act?.created_at, 'relative')}</CText>}
							</View>
							<TouchableOpacity
								style={styles.viewBtn}
								onPress={() => handleView(item.StudentActivityID, act?.Title, act?.ActivityID, item?.activity?.ActivityTypeID)}
							>
								<CText fontStyle="SB" style={{ color: theme.colors.light.primary }}>View Activity</CText>
							</TouchableOpacity>
						</>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	const renderFilterHeader = () => (
		<View>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
				<View style={styles.filterRow}>
					{types.map(({ label, value }) => (
						<TouchableOpacity
							key={value.toString()}
							onPress={() => filterActivities(value)}
							style={[styles.filterBtn, actType === value && styles.activeBtn]}
						>
							<CText fontStyle="SB" style={{ color: actType === value ? '#fff' : '#000' }}>{label}</CText>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
			<LastUpdatedBadge
				date={lastFetched}
				onReload={fetchActivities}
			/>
			{loading && (
				<>
					<ActivityIndicator2 />
				</>
			)}
		</View>
	);

	return (
		<>
			{/*<BackHeader title="Activities" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />*/}
			<SafeAreaView style={[globalStyles.safeArea2]}>
				<FlatList
					data={activities}
					keyExtractor={(item, index) => `${item.StudentActivityID}-${index}`}
					renderItem={renderItem}
					ListHeaderComponent={renderFilterHeader}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={!loading && (
						<View style={styles.empty}>
							<CText fontSize={14} style={styles.emptyText}>No activities found</CText>
						</View>
					)}
				/>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.light.card,
		borderRadius: theme.radius.sm,
		marginBottom: 14,
		borderWidth: 1,
		borderColor: '#e2e2e2',
		elevation: 1,
	},
	cardInner: {
		padding: 0,
	},
	desc: {
		color: '#444',
		marginTop: 6,
	},
	dateRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 12,
	},
	date: {
		color: '#777',
	},
	filterScroll: {
		paddingHorizontal: 10,
		marginBottom: 10,
	},
	filterRow: {
		flexDirection: 'row',
		gap: 8,
		marginHorizontal: 20,
	},
	filterBtn: {
		backgroundColor: '#F8F8F8',
		borderWidth: 1,
		borderColor: '#e1e1e1',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: theme.radius.sm,
		minHeight: 35,
		justifyContent: 'center',
	},
	activeBtn: {
		backgroundColor: theme.colors.light.primary,
	},
	empty: {
		padding: 20,
		alignItems: 'center',
	},
	emptyText: {
		color: '#888',
	},
	listContent: {
		padding: 10,
		paddingBottom: 100,
	},
	viewBtn: {
		marginTop: 10,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: theme.radius.sm,
		borderWidth: 1,
		borderColor: theme.colors.light.primary,
		alignSelf: 'flex-start',
	},
});

export default ActivityScreen;
