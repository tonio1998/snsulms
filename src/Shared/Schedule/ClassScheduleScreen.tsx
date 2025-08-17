import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View, Text } from 'react-native';
import { SafeAreaView } from "react-native";
import { globalStyles } from "../../theme/styles.ts";
import { theme } from "../../theme";
import { useClass } from "../../context/SharedClassContext.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import {CText} from "../../components/common/CText.tsx";
import HomeHeader from "../../components/layout/HomeHeader.tsx";

const dayLabels = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', Th: 'Thursday', F: 'Friday', S: 'Saturday', Su: 'Sunday' };

const ClassScheduleScreen = () => {
	const { classes, refresh, loading } = useClass();
	const [refreshing, setRefreshing] = useState(false);
	const [schedules, setSchedules] = useState([]);

	const fetchClassSchedule = () => {
		try {
			const res = classes?.schedules || [];
			const dayOrder = { M: 1, T: 2, W: 3, Th: 4, F: 5, S: 6, Su: 7 };

			const sorted = [...res].sort(
				(a, b) => (dayOrder[a.Day] || 99) - (dayOrder[b.Day] || 99)
			);

			console.log('🔍 Fetched class schedulesss', sorted);
			setSchedules(sorted);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchClassSchedule();
	}, []);

	const onRefresh = async () => {
		setRefreshing(true);
		await refresh();
		setRefreshing(false);
	};

	const formatTime = (time) => {
		if (!time) return '';
		const [hour, minute] = time.split(':');
		const h = parseInt(hour, 10);
		const ampm = h >= 12 ? 'PM' : 'AM';
		const formattedHour = h % 12 || 12;
		return `${formattedHour}:${minute} ${ampm}`;
	};

	return (
		<>
			{/*<BackHeader title="Class Schedule" />*/}
			{/*<HomeHeader title="Class Schedule" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />*/}
			<SafeAreaView style={[globalStyles.safeArea2]}>
				<ScrollView
					contentContainerStyle={styles.container}
					refreshControl={
						<RefreshControl
							refreshing={refreshing || loading}
							onRefresh={onRefresh}
							colors={[theme.colors.light.primary]}
							tintColor={theme.colors.light.primary}
						/>
					}
				>
					{Array.isArray(schedules) && schedules.length > 0 ? (
						schedules.map((item) => (
							<View style={styles.card} key={item?.ScheduleID}>
								<Text style={styles.day}>{dayLabels[item?.Day] || item?.Day}</Text>
								<Text style={styles.time}>
									{formatTime(item?.TimeFrom)} - {formatTime(item?.TimeTo)}
								</Text>
								<Text style={styles.room}>
									Room: {item?.room?.RoomCode || item?.RoomID}
								</Text>
							</View>
						))
					) : (
						<Text style={styles.noEventsText}>No class schedule found.</Text>
					)}

					<CText style={{ color: theme.colors.light.primary, fontSize: 12, marginBottom: 10, paddingHorizontal: 16 }}>
						Note: The schedules shown here are from the fbUIS Mobile App and correspond to the class imported from enrollment.
					</CText>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	container: { flexGrow: 1, backgroundColor: '#fff', padding: 16, paddingBottom: 20 },
	noEventsText: { textAlign: 'center', fontSize: 16, color: '#444', padding: 10 },
	card: {
		backgroundColor: '#f8f8f8',
		padding: 16,
		marginBottom: 12,
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: theme.colors.light.secondary,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
		elevation: 2
	},
	day: { fontSize: 18, fontWeight: 'bold', color: theme.colors.light.text },
	time: { fontSize: 16, color: '#333', marginTop: 4 },
	room: { fontSize: 14, color: '#666', marginTop: 2 },
});

export default ClassScheduleScreen;
