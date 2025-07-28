import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	View,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Image,
	StyleSheet,
	ScrollView,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { CText } from '../../../components/CText.tsx';
import { getStudentActivities } from "../../../api/modules/activitiesApi.ts";
import { formatDate } from "../../../utils/dateFormatter";
import BackHeader from "../../../components/BackHeader.tsx";
import BackgroundWrapper from "../../../utils/BackgroundWrapper";
import { NetworkContext } from "../../../context/NetworkContext.tsx";
import { getOfflineActivities, saveActivitiesOffline } from "../../../utils/sqlite/offlineActivityService.ts";

const ActivityScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const network = useContext(NetworkContext);
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const [actType, setActType] = useState('');
	const [allActivities, setAllActivities] = useState([]);

	const activityTypes = [
		{ label: 'All', value: '' },
		// { label: 'Resource', value: 1 },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz', value: 3 },
		{ label: 'Exam', value: 4 }
	];

	const fetchActivities = async () => {
		try {
			if (loading) return;
			setLoading(true);
			showLoading('Loading activities...');

			const filter = { page: 1, search: '', ClassID };
			let list = await getOfflineActivities({ ClassID });

			if (list?.length) {
				setAllActivities(list);
				setActivities(list);
				handleActTypeFilter(actType, list);
			}

			if (network?.isOnline) {
				const res = await getStudentActivities(filter);
				const onlineList = res?.data || [];

				if (!list?.length || JSON.stringify(onlineList) !== JSON.stringify(list)) {
					await saveActivitiesOffline(onlineList, ClassID);
					setAllActivities(onlineList);
					setActivities(onlineList);
					handleActTypeFilter(actType, onlineList);
				}
			}

		} catch (err) {
			handleApiError(err, 'Failed to fetch activities');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};


	useEffect(() => {
		if (ClassID) fetchActivities();
	}, [ClassID]);


	// useFocusEffect(
	// 	useCallback(() => {
	// 		if (ClassID) fetchActivities();
	// 	}, [ClassID])
	// );

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	const handleActTypeFilter = (type, list = allActivities) => {
		setActType(type);

		const filtered = list.filter(item => item.activity.ActivityTypeID !== 1);

		if (type) {
			setActivities(filtered.filter(item => item.activity.ActivityTypeID == type));
		} else {
			setActivities(filtered);
		}
	};


	const handleViewAct = (StudentActivityID, Title, ActivityID) => {
		navigation.navigate('ActivityDetails', { StudentActivityID, Title, ActivityID});
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity style={styles.card}
						  onPress={() => handleViewAct(item.StudentActivityID, item.activity.Title, item.activity.ActivityID)}
		>
			<View style={{ padding: 16 }}>
				<CText fontSize={16} fontStyle="SB" style={{ color: '#000' }}>
					{item?.activity?.Title}
				</CText>
				<CText fontSize={14} style={{ color: '#444', marginTop: 4 }}>
					{item?.activity?.Description}
				</CText>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
					<CText fontSize={12} style={{ color: '#777' }}>
						Due: {formatDate(item?.activity?.DueDate)}
					</CText>
					<CText fontSize={12} style={{ color: '#777' }}>
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
			style={{ paddingHorizontal: 10, marginBottom: 10 }}
		>
			<View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 20 }}>
				{activityTypes.map((type, idx) => (
					<TouchableOpacity
						key={idx}
						onPress={() => handleActTypeFilter(type.value)}
						style={[
							styles.filterBtn,
							actType === type.value && styles.activeFilterBtn
						]}
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
						contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						ListEmptyComponent={
							!loading && (
								<View style={{ padding: 20, alignItems: 'center' }}>
									<CText fontSize={14} style={{ color: '#888' }}>
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
		borderRadius: 8,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#ddd'
	},
	filterBtn: {
		backgroundColor: '#ccc',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
		minHeight: 35,
		justifyContent: 'center',
	},
	activeFilterBtn: {
		backgroundColor: theme.colors.light.primary,
	},
});

export default ActivityScreen;
