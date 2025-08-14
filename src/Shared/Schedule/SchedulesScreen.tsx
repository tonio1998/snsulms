import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, SafeAreaView, RefreshControl, Image } from 'react-native';
import { globalStyles } from '../../theme/styles.ts';
import CustomHeader2 from '../../components/layout/CustomHeader2.tsx';
import { getAllSchedules } from '../../api/modules/schedulesApi.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { useFocusEffect } from '@react-navigation/native';
import { getAcademicInfo } from '../../utils/getAcademicInfo.ts';
import { theme } from "../../theme";
import { useLoading2 } from "../../context/Loading2Context.tsx";
import { loadScheduleCache, saveScheduleCache } from "../../utils/cache/localSchedule";
import { useAuth } from "../../context/AuthContext.tsx";
import { LastUpdatedBadge } from "../../components/common/LastUpdatedBadge";
import { CText } from "../../components/common/CText.tsx";

const dayLabels = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', Th: 'Thursday', F: 'Friday', S: 'Saturday', Su: 'Sunday' };
const colors = ['#FFB6C1', '#87CEFA', '#90EE90', '#FFD700', '#FF7F50', '#DA70D6'];

const startHour = 7;
const endHour = 21;
const slotHeight = 40;

const getMinutesSinceStart = (time: string) => {
	const [h, m] = time.split(':').map(Number);
	return (h - startHour) * 60 + m;
};

const format12Hour = (time: string) => {
	const [hour, minute] = time.split(':').map(Number);
	const ampm = hour >= 12 ? 'PM' : 'AM';
	const h = hour % 12 || 12;
	return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
};

const generateTimeSlots = () => {
	const slots: string[] = [];
	for (let h = startHour; h < endHour; h++) {
		const start1 = `${String(h).padStart(2,'0')}:00`;
		const end1 = `${String(h).padStart(2,'0')}:30`;
		slots.push(`${format12Hour(start1)}-${format12Hour(end1)}`);

		const start2 = `${String(h).padStart(2,'0')}:30`;
		const end2 = `${String(h+1).padStart(2,'0')}:00`;
		slots.push(`${format12Hour(start2)}-${format12Hour(end2)}`);
	}
	return slots;
};

const SchedulesScreen = () => {
	const { user } = useAuth();
	const [refreshing, setRefreshing] = useState(false);
	const [schedules, setSchedules] = useState<any[]>([]);
	const [acad, setAcad] = useState<string | null>(null);
	const { showLoading2, hideLoading2 } = useLoading2();
	const [lastFetched, setLastFetched] = useState<Date | null>(null);

	const fetchClassSchedule = async (acadStr: string) => {
		showLoading2('Loading schedules...');
		try {
			const res = await getAllSchedules({ AcademicYear: acadStr });
			if (res) {
				console.log('🔍 Fetched class schedules', res);
				const now = await saveScheduleCache(user?.id, acadStr, res);
				setLastFetched(now);
				setSchedules(res);
			}
		} catch (error) {
			handleApiError(error, 'Fetch Class Schedules');
		} finally {
			hideLoading2();
		}
	};

	const fetchLocal = async (acadStr: string) => {
		const { data, date } = await loadScheduleCache(user?.id, acadStr);
		if (data) {
			setSchedules(data);
			setLastFetched(date);
		} else {
			await fetchClassSchedule(acadStr);
		}
	};

	useEffect(() => { if (acad) fetchLocal(acad); }, [acad]);

	useFocusEffect(
		useCallback(() => {
			let isActive = true;
			(async () => {
				try {
					const acadInfo = await getAcademicInfo();
					const acadStr = `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
					if (isActive) {
						setAcad(acadStr);
						await fetchLocal(acadStr);
					}
				} catch (err) { console.error('Error fetching academic info', err); }
			})();
			return () => { isActive = false; };
		}, [])
	);

	const onRefresh = async () => {
		if (acad) {
			setRefreshing(true);
			await fetchClassSchedule(acad);
			setRefreshing(false);
		}
	};

	const timeSlots = generateTimeSlots();

	return (
		<>
			<CustomHeader2 />
			<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 100 }]}>
				<View style={{paddingHorizontal: 16 }}>
					<LastUpdatedBadge date={lastFetched} onReload={() => acad && fetchClassSchedule(acad)} />
				</View>
				<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
					<ScrollView horizontal>
						<View style={styles.table}>
							<View style={styles.timeColumn}>
								<View style={styles.headerCell}><Text style={styles.headerText}>Time</Text></View>
								{timeSlots.map((range, idx) => (
									<View key={idx} style={styles.timeCell}>
										<Text style={styles.timeText}>{range}</Text>
									</View>
								))}
							</View>

							{Object.keys(dayLabels).map(dayKey => {
								const daySched = schedules
									.filter(s => s.Day === dayKey)
									.sort((a, b) => a.TimeFrom.localeCompare(b.TimeFrom));

								const lunchStart = getMinutesSinceStart('12:00');
								const lunchEnd = getMinutesSinceStart('13:00');
								const hasLunchClass = daySched.some(cls => !(cls.TimeTo <= '12:00' || cls.TimeFrom >= '13:00'));

								return (
									<View key={dayKey} style={styles.dayColumn}>
										<View style={styles.headerCell}>
											<Text style={styles.headerText}>{dayLabels[dayKey]}</Text>
										</View>
										<View style={{ position: 'relative' }}>
											{timeSlots.map((_, idx) => (<View key={idx} style={styles.cell} />))}

											{daySched.map((cls, i) => {
												const top = getMinutesSinceStart(cls.TimeFrom) * (slotHeight / 30);
												const height = (getMinutesSinceStart(cls.TimeTo) - getMinutesSinceStart(cls.TimeFrom)) * (slotHeight / 30);
												return (
													<View key={i} style={[styles.classBlock, { top, height, backgroundColor: colors[i % colors.length], width: '100%' }]}>
														<Text style={styles.classTitle} numberOfLines={1}>{cls.class_info?.CourseCode || cls.class_info?.CourseName}</Text>
														{/*<Text style={styles.classTime}>{format12Hour(cls.TimeFrom)} - {format12Hour(cls.TimeTo)}</Text>*/}
														<Text style={styles.classTime}>{cls?.room?.RoomCode}</Text>
														{cls.class_info?.teacher && (
															<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: '#fff', borderRadius: 8, padding: 5 }}>
																<Image source={{ uri: cls.class_info.teacher.avatar }} style={{ width: 20, height: 20, borderRadius: 15, marginRight: 4 }} />
																<CText fontSize={11} numberOfLines={1}>{cls.class_info.teacher.name}</CText>
															</View>
														)}
													</View>
												);
											})}

											{!hasLunchClass && (
												<View style={[styles.classBlock, { top: lunchStart*(slotHeight/30), height:(lunchEnd-lunchStart)*(slotHeight/30), backgroundColor:'#eee', width:'100%' }]}>
													<Text style={styles.classTitle}>Lunch Break</Text>
													<Text style={styles.classTime}>12:00 PM - 1:00 PM</Text>
												</View>
											)}
										</View>
									</View>
								);
							})}
						</View>
					</ScrollView>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	table: { flexDirection: 'row', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, overflow: 'hidden', backgroundColor: '#fff' },
	timeColumn: { borderRightWidth: 1, borderColor: '#ccc' },
	dayColumn: { borderRightWidth: 1, borderColor: '#ccc', width: 130 },
	headerCell: { height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.light.primary || '#004D1A', borderBottomWidth: 1, borderColor: '#ccc' },
	headerText: { color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
	timeCell: { height: slotHeight, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
	timeText: { fontSize: 10, color: '#555' },
	cell: { height: slotHeight, borderBottomWidth: 1, borderColor: '#eee' },
	classBlock: { position: 'absolute', padding: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, justifyContent: 'center', alignItems: 'center' },
	classTitle: { fontSize: 12, fontWeight: 'bold', color: '#000', textAlign: 'center' },
	classTime: { fontSize: 11, color: '#333' },
});

export default SchedulesScreen;
