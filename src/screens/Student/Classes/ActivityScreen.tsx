import React, { useEffect, useState } from 'react';
import {
	View, FlatList, RefreshControl, SafeAreaView,
	ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { CText } from '../../../components/common/CText.tsx';
import { getStudentActivities } from '../../../api/modules/activitiesApi.ts';
import { formatDate } from '../../../utils/dateFormatter';
import BackHeader from '../../../components/layout/BackHeader.tsx';
import Icon from "react-native-vector-icons/Ionicons";

const ActivityScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const [allActivities, setAllActivities] = useState([]);
	const [activities, setActivities] = useState([]);
	const [actType, setActType] = useState('');
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [expandedId, setExpandedId] = useState(null);
	const { showLoading, hideLoading } = useLoading();

	const types = [
		{ label: 'All', value: '' },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz/Exam', value: 3 },
		// { label: 'Exam', value: 4 },
	];

	const fetchActivities = async () => {
		if (loading || !ClassID) return;
		try {
			setLoading(true);
			showLoading('Loading activities...');
			const res = await getStudentActivities({ page: 1, search: '', ClassID });
			const list = res?.data ?? [];
			setAllActivities(list);
			filterActivities(actType, list);
		} catch (err) {
			console.error('❌ Error loading activities:', err);
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useEffect(() => { fetchActivities(); }, [ClassID]);
	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	const filterActivities = (type, list = allActivities) => {
		setActType(type);
		const filtered = list.filter(i => i.activity?.ActivityTypeID !== 1);
		setActivities(type ? filtered.filter(i => i.activity?.ActivityTypeID == type) : filtered);
		setExpandedId(null); // Collapse when switching filters
	};

	const toggleExpand = (id) => {
		setExpandedId(prev => (prev === id ? null : id));
	};

	const handleView = (id, title, actId) => {
		navigation.navigate('ActivityDetails', {
			StudentActivityID: id,
			Title: title,
			ActivityID: actId,
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
						<View>
							{submitted && (
								<Icon name="checkmark-circle" size={22} color={theme.colors.light.success} />
							)}
						</View>
					</View>
					<CText fontSize={14} style={styles.desc}>{act?.Description}</CText>
					{isExpanded && (
						<>
							<View style={[styles.dateRow, { marginTop: 6 }]}>
								<CText fontSize={13} fontStyle={'SB'} style={{ color: submitted ? theme.colors.light.success : theme.colors.light.danger }}>
									{submissionText}{submittedDate}
								</CText>
							</View>
							<View style={styles.dateRow}>
								<CText fontSize={12} style={styles.date}>Due: {formatDate(act?.DueDate)}</CText>
								<CText fontSize={12} style={styles.date}>Created: {formatDate(act?.created_at, 'relative')}</CText>
							</View>
							<TouchableOpacity
								style={styles.viewBtn}
								onPress={() => handleView(item.StudentActivityID, act?.Title, act?.ActivityID)}
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
	);

	return (
		<>
			<BackHeader title="Activities" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
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

export default ActivityScreen;
