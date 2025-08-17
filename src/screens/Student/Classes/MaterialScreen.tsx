import React, { useEffect, useState } from 'react';
import {
	View, FlatList, RefreshControl, SafeAreaView,
	ScrollView, TouchableOpacity, StyleSheet, Text,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { CText } from '../../../components/common/CText.tsx';
import { getStudentActivities } from '../../../api/modules/activitiesApi.ts';
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

const StudentMaterialScreen = ({ navigation, route }) => {
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
		{ label: 'Materials', value: 1 },
	];

	const filterActivities = (type, list = allActivities) => {
		setActivities(list.filter(item => item.activity.ActivityTypeID === 1));
	};

	const fetchActivities = async () => {
		if (loading || !ClassID) return;
		try {
			setLoading(true);
			const res = await getStudentActivities({ page: 1, search: '', ClassID });
			const list = res?.data ?? [];
			console.log("🔍 Fetched activities", list);
			setAllActivities(list);
			filterActivities(actType, list);
			const date = await saveStudentClassActivitiesCache(ClassID, user?.id, list);
			if (date) setLastFetched(date);
		} catch (err) {
			console.error('❌ Error loading activities:', err);
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

	const handleViewAct = (StudentActivityID, Title) => {
		navigation.navigate('ActivityDetails', {
			StudentActivityID,
			Title,
			type: actType
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
				style={styles.card}
				onPress={() => toggleExpand(item.StudentActivityID)}
				activeOpacity={0.9}
			>
				<View style={styles.cardInner}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<CText fontSize={16} fontStyle="SB">{act?.Title}</CText>
					</View>
					{act?.Description && (
						<CText fontSize={14} style={styles.desc}>{act?.Description}</CText>
					)}
					{isExpanded && (
						<>
							<View style={[styles.dateRow, { marginTop: 6 }]}>
								<CText fontSize={13} fontStyle={'SB'} style={{ color: submitted ? theme.colors.light.success : theme.colors.light.danger }}>
									{submissionText}{submittedDate}
								</CText>
							</View>
							<View style={styles.dateRow}>
								{act?.DueDate && <CText fontSize={12} style={styles.date}>Due: {formatDate(act?.DueDate)}</CText>}
								{act?.created_at && <CText fontSize={12} style={styles.date}>Created: {formatDate(act?.created_at, 'relative')}</CText>}
							</View>
							<TouchableOpacity
								style={styles.viewBtn}
								onPress={() => handleViewAct(item.StudentActivityID, item.activity.Title)}
							>
								<CText fontStyle="SB" style={{ color: theme.colors.light.primary }}>View</CText>
							</TouchableOpacity>
						</>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<>
			<SafeAreaView style={[globalStyles.safeArea2]}>

				<FlatList
					data={activities}
					keyExtractor={(item, index) => `${item.StudentActivityID}-${index}`}
					renderItem={renderItem}
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
		padding: 16,
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
		borderRadius: 20,
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
		borderRadius: theme.radius.xs,
		borderWidth: 1,
		borderColor: theme.colors.light.primary,
		alignSelf: 'flex-start',
	},
});

export default StudentMaterialScreen;
