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
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { useLoading } from '../../../../context/LoadingContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { CText } from '../../../../components/common/CText.tsx';
import { getStudentActivities } from "../../../../api/modules/activitiesApi.ts";
import { formatDate } from "../../../../utils/dateFormatter";
import BackHeader from "../../../../components/layout/BackHeader.tsx";
import BackgroundWrapper from "../../../../utils/BackgroundWrapper";
import { NetworkContext } from "../../../../context/NetworkContext.tsx";
import { getOfflineActivities, saveActivitiesOffline } from "../../../../utils/sqlite/offlineActivityService.ts";

const MaterialsScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const Type = route.params.type;
	const network = useContext(NetworkContext);
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const [actType, setActType] = useState(1);
	const [allActivities, setAllActivities] = useState([]);

	const activityTypes = [
		// { label: 'All', value: '' },
		{ label: 'Resource', value: 1 },
		// { label: 'Assignment', value: 2 },
		// { label: 'Quiz', value: 3 },
		// { label: 'Exam', value: 4 }
	];

	const fetchActivities = async () => {
		try {
			setLoading(true);
			showLoading('Loading activities...');

			let list = [];
			const filter = { page: 1, search: '', ClassID };

			if (network?.isOnline) {
				const res = await getStudentActivities(filter);
				list = res?.data || [];
				await saveActivitiesOffline(list, ClassID);
			} else {
				list = await getOfflineActivities({ ClassID });
			}

			setAllActivities(list);
			setActivities(list);
			handleActTypeFilter(actType, list);

		} catch (err) {
			handleApiError(err, 'Failed to fetch activities');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useFocusEffect(
		useCallback(() => {
			if (ClassID) fetchActivities();
		}, [ClassID])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	const handleActTypeFilter = (type, list = allActivities) => {
		setActType(type);
		if (!type) {
			setActivities(list);
		} else {
			setActivities(list.filter(item => item.activity.ActivityTypeID === type));
		}
	};

	const handleViewAct = (StudentActivityID, Title) => {
		navigation.navigate('ActivityDetails', {
			StudentActivityID,
			Title,
			type: actType
		});
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity style={styles.card}
						  onPress={() => handleViewAct(item.StudentActivityID, item.activity.Title)}
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
			<BackHeader title="Materials" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
				<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
					<FlatList
						data={activities}
						keyExtractor={(item) => item.StudentActivityID.toString()}
						renderItem={renderItem}
						// ListHeaderComponent={renderFilterHeader}
						contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						ListEmptyComponent={
							!loading && (
								<View style={{ padding: 20, alignItems: 'center' }}>
									<CText fontSize={14} style={{ color: '#888' }}>
										No materials found
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
		borderRadius: 20,
		minHeight: 35,
		justifyContent: 'center',
	},
	activeFilterBtn: {
		backgroundColor: theme.colors.light.primary,
	},
});

export default MaterialsScreen;
