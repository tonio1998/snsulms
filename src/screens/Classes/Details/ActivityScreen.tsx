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
	StyleSheet, ScrollView,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { CText } from '../../../components/CText.tsx';
import CButton from '../../../components/CButton.tsx';
import {getActivities, getStudentActivities} from "../../../api/modules/activitiesApi.ts";
import {formatDate} from "../../../utils/dateFormatter";

const ActivityScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const [actType, setActType] = useState('');
	const [allActivities, setAllActivities] = useState([]);


	navigation.setOptions({
		headerTitle: 'Activities',
		headerTitleStyle: {
			fontSize: 18,
			color: '#fff',
			fontWeight: 'bold',
		},
	});

	const fetchActivities = async () => {
		try {
			setLoading(true);
			showLoading('Loading activities...');
			let List = [];
			const filter = {
				page: 1,
				search: '',
				ClassID: ClassID,
			};
			const res = await getStudentActivities(filter);
			handleActTypeFilter('')
			console.log(activities);
			setActivities(res?.data || []);
			setAllActivities(res.data || []);
		} catch (err) {
			handleApiError(err, 'Failed to fetch activities');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useFocusEffect(
		useCallback(() => {
			if (ClassID) {
				fetchActivities();
			}
		}, [ClassID])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	const handleActTypeFilter = (level) => {
		setActType(level);
		if (!level) {
			setActivities(allActivities);
		} else {
			const filtered = allActivities.filter(item => item.activity.ActivityTypeID === level);
			setActivities(filtered);
		}
	};

	const handleViewAct = (StudentActivityID, Title) => {
		navigation.navigate('ActivityDetails', { StudentActivityID, Title });
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity style={styles.card}
						  onPress={() =>
							  handleViewAct(
								  item.StudentActivityID,
								  item.activity.Title
							  )
						  }>
			<View style={{ padding: 16 }}>
				<CText fontSize={16} fontStyle={'SB'} style={{ color: '#000' }}>
					{item?.activity?.Title}
				</CText>
				<CText fontSize={14} fontStyle={'R'} style={{ color: '#000' }}>
					{item?.activity?.Description}
				</CText>
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<View>
						<CText fontSize={11} style={{ color: '#999', marginTop: 6 }}>
							Due: { formatDate(item?.activity?.DueDate) }
						</CText>
					</View>
					<View>
						<CText fontSize={11} style={{ color: '#999', marginTop: 6 }}>
							Created on: { formatDate(item?.activity?.created_at, 'relative') }
						</CText>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);

	const activityTypes = [
		{ label: 'All', value: '' },
		{ label: 'Resource', value: 1 },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz', value: 3 },
		{ label: 'Exam', value: 4 }
	];


	return (
		<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 10}]}>
			<FlatList
				data={activities}
				keyExtractor={(item) => item.StudentActivityID.toString()}
				renderItem={renderItem}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
				contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
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
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.options]}>
				<View style={{ flexDirection: 'row', marginBottom: 10, paddingHorizontal: 10 }}>
					{activityTypes.map((type, idx) => (
						<TouchableOpacity
							key={idx}
							onPress={() => handleActTypeFilter(type.value)}
							style={[{
								backgroundColor: actType === type.value ? theme.colors.light.primary : '#ccc',
								paddingVertical: 5,
								paddingHorizontal: 20,
								borderRadius: 7,
								marginRight: 8,
								marginBottom: 8,
								alignItems: 'center',
								justifyContent: 'center',
								minHeight: 35,
								maxHeight: 35,
							}]}
						>
							<CText style={{ color: '#fff' }} fontStyle={'SB'} numberOfLines={1} fontSize={16}>
								{type.label}
							</CText>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	options: {
		position: 'absolute',
		bottom: 0,
		padding: 10,
		height: 60,
		// backgroundColor: '#fff',
	},
	card: {
		backgroundColor: theme.colors.light.card,
		borderRadius: 8,
		marginBottom: 10,
	},
	floatBtn: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
	fab: {
		backgroundColor: theme.colors.light.primary,
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	},
});

export default ActivityScreen;
