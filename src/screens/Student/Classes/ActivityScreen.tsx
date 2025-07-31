import React, { useEffect, useState } from 'react';
import {
	View,
	FlatList,
	RefreshControl,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { CText } from '../../../components/common/CText.tsx';
import { getStudentActivities } from '../../../api/modules/activitiesApi.ts';
import { formatDate } from '../../../utils/dateFormatter';
import BackHeader from '../../../components/layout/BackHeader.tsx';

const ActivityScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const [actType, setActType] = useState('');
	const [allActivities, setAllActivities] = useState([]);

	const activityTypes = [
		{ label: 'All', value: '' },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz', value: 3 },
		{ label: 'Exam', value: 4 },
	];

	const fetchActivities = async () => {
		if (loading || !ClassID) return;
		try {
			setLoading(true);
			showLoading('Loading activities...');
			const res = await getStudentActivities({ page: 1, search: '', ClassID });
			const list = res?.data ?? [];
			setAllActivities(list);
			handleActTypeFilter(actType, list);
		} catch (err) {
			console.error('❌ Failed to fetch activities:', err);
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useEffect(() => {
		fetchActivities();
	}, [ClassID]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	const handleActTypeFilter = (type, list = allActivities) => {
		setActType(type);
		const filtered = list.filter(item => item.activity?.ActivityTypeID !== 1);
		setActivities(type ? filtered.filter(item => item.activity?.ActivityTypeID == type) : filtered);
	};

	const handleViewAct = (StudentActivityID, Title, ActivityID) => {
		navigation.navigate('ActivityDetails', { StudentActivityID, Title, ActivityID });
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => handleViewAct(item.StudentActivityID, item.activity.Title, item.activity.ActivityID)}
		>
			<View style={{ padding: 16 }}>
				<CText fontSize={16} fontStyle="SB" style={styles.titleText}>
					{item?.activity?.Title}
				</CText>
				<CText fontSize={14} style={styles.descriptionText}>
					{item?.activity?.Description}
				</CText>
				<View style={styles.dateRow}>
					<CText fontSize={12} style={styles.dateText}>
						Due: {formatDate(item?.activity?.DueDate)}
					</CText>
					<CText fontSize={12} style={styles.dateText}>
						Created: {formatDate(item?.activity?.created_at, 'relative')}
					</CText>
				</View>
			</View>
		</TouchableOpacity>
	);

	const renderFilterHeader = () => (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.filterScroll}
		>
			<View style={styles.filterRow}>
				{activityTypes.map((type, idx) => (
					<TouchableOpacity
						key={idx}
						onPress={() => handleActTypeFilter(type.value)}
						style={[styles.filterBtn, actType === type.value && styles.activeFilterBtn]}
					>
						<CText style={{ color: actType === type.value ? '#fff' : '#000' }} fontStyle="SB">
							{type.label}
						</CText>
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
					keyExtractor={(item) => item.StudentActivityID.toString()}
					renderItem={renderItem}
					ListHeaderComponent={renderFilterHeader}
					contentContainerStyle={styles.listContent}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					ListEmptyComponent={
						!loading && (
							<View style={styles.emptyContainer}>
								<CText fontSize={14} style={styles.emptyText}>
									No activities found
								</CText>
							</View>
						)
					}
				/>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.light.card,
		borderRadius: 12,
		marginBottom: 14,
		borderWidth: 1,
		borderColor: '#e2e2e2',
		elevation: 1,
	},
	titleText: {
		color: '#000',
	},
	descriptionText: {
		color: '#444',
		marginTop: 6,
	},
	dateRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 12,
	},
	dateText: {
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
		backgroundColor: '#ccc',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
		minHeight: 35,
		justifyContent: 'center',
	},
	activeFilterBtn: {
		backgroundColor: theme.colors.light.primary,
	},
	emptyContainer: {
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
});

export default ActivityScreen;
