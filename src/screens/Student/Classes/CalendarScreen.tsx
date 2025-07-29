import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, SafeAreaView, StyleSheet, RefreshControl } from 'react-native';
import { Calendar } from 'react-native-calendars';
import BackHeader from '../../../components/layout/BackHeader.tsx';
import BackgroundWrapper from "../../../utils/BackgroundWrapper";
import CustomHeader from "../../../components/layout/CustomHeader.tsx";
import { globalStyles } from "../../../theme/styles.ts";
import { CText } from "../../../components/common/CText.tsx";
import { getStudentActivities } from "../../../api/modules/activitiesApi.ts";
import { NetworkContext } from "../../../context/NetworkContext.tsx";
import { saveActivitiesOffline, getOfflineActivities } from "../../../utils/sqlite/offlineActivityService.ts";
import { formatDate } from "../../../utils/dateFormatter.ts";

const CalendarScreen = ({ route }) => {
	const ClassID = route.params?.ClassID;
	const network = useContext(NetworkContext);

	const [selectedDate, setSelectedDate] = useState('');
	const [activities, setActivities] = useState([]);
	const [markedDates, setMarkedDates] = useState({});
	const [refreshing, setRefreshing] = useState(false);

	// Fetch activities
	const fetchActivities = async () => {
		let list = [];
		try {
			if (network?.isOnline) {
				const res = await getStudentActivities({ page: 1, search: '', ClassID });
				list = res?.data || [];
				await saveActivitiesOffline(list, ClassID);
			} else {
				list = await getOfflineActivities({ ClassID });
			}
			setActivities(list);
			updateMarkedDates(list);
		} catch (err) {
			console.error('Failed to fetch activities', err);
		}
	};

	const updateMarkedDates = (list) => {
		const marks = {};
		list.forEach((item) => {
			if (!item?.activity?.DueDate) return;
			if (item?.activity?.ActivityTypeID === 1) return; // Skip Resource type
			const dateStr = item.activity.DueDate;

			marks[dateStr] = {
				marked: true,
				dotColor: '#00adf5', // Customize per type if needed
			};
		});
		setMarkedDates(marks);
	};

	useEffect(() => {
		if (ClassID) fetchActivities();
	}, [ClassID]);

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	return (
		<>
			<BackHeader title="Calendar" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
					<Calendar
						onDayPress={(day) => setSelectedDate(day.dateString)}
						current={new Date().toISOString().split('T')[0]}
						markedDates={{
							...markedDates,
							...(selectedDate && {
								[selectedDate]: {
									...(markedDates[selectedDate] || {}),
									selected: true,
									selectedColor: '#3b82f6',
								}
							})
						}}
						style={{ borderRadius: 12, marginBottom: 10 }}
					/>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
});

export default CalendarScreen;
