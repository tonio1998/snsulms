import React, { useEffect, useState, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ActivityIndicator,
	FlatList,
	Modal,
	TouchableOpacity,
	Pressable,
	ScrollView,
	Linking,
	RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAuth } from "../context/AuthContext.tsx";
import { format, parseISO } from 'date-fns';
import { globalStyles } from "../theme/styles.ts";
import CustomHeader from "../components/layout/CustomHeader.tsx";
import { theme } from "../theme";
import CustomHeader2 from "../components/layout/CustomHeader2.tsx";

LocaleConfig.locales['en'] = {
	monthNames: [
		'January','February','March','April','May','June',
		'July','August','September','October','November','December'
	],
	monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
	dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
};
LocaleConfig.defaultLocale = 'en';

const STORAGE_KEY_PREFIX = 'cachedGoogleCalendarEvents_';

const fetchGoogleCalendarEvents = async (accessToken) => {
	if (!accessToken) throw new Error("Access token is required");

	try {
		const response = await fetch(
			'https://www.googleapis.com/calendar/v3/calendars/primary/events',
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		const events = data.items || [];

		const filteredEvents = events.filter(event =>
			event?.conferenceData?.createRequest?.requestId?.toLowerCase().startsWith('snsu-meet-')
		);

		filteredEvents.sort((a, b) => {
			const aDate = a.start?.dateTime || a.start?.date || '';
			const bDate = b.start?.dateTime || b.start?.date || '';
			return aDate.localeCompare(bDate);
		});

		return filteredEvents;
	} catch (error) {
		console.error('Error fetching Google Calendar events:', error);
		return [];
	}
};


const CalendarScreen = () => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedDate, setSelectedDate] = useState(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const { user } = useAuth();
	const email = user?.email;

	const loadEvents = useCallback(async () => {
		setLoading(true);

		try {
			const cachedEventsJSON = await AsyncStorage.getItem(STORAGE_KEY_PREFIX + email);
			if (cachedEventsJSON) {
				const cachedEvents = JSON.parse(cachedEventsJSON);
				setEvents(cachedEvents);
			}

			const accessToken = await AsyncStorage.getItem(`googleAccessToken${email}`);
			if (!accessToken) throw new Error('No Google access token found');

			const calendarEvents = await fetchGoogleCalendarEvents(accessToken);
			setEvents(calendarEvents);

			await AsyncStorage.setItem(STORAGE_KEY_PREFIX + email, JSON.stringify(calendarEvents));
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [email]);

	useEffect(() => {
		loadEvents();
	}, [loadEvents]);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await loadEvents();
		} catch (error) {
			console.error(error);
		} finally {
			setRefreshing(false);
		}
	};

	const markedDates = events.reduce((acc, event) => {
		const dateStr = event.start?.date || event.start?.dateTime?.substring(0, 10);
		if (!dateStr) return acc;

		acc[dateStr] = {
			marked: true,
			dotColor: '#FFD04C',
			activeOpacity: 0,
		};
		return acc;
	}, {});

	const eventsForSelectedDate = selectedDate
		? events.filter((event) => {
			const eventDate = event.start?.date || event.start?.dateTime?.substring(0, 10);
			return eventDate === selectedDate;
		})
		: [];

	const openEventModal = (event) => {
		setSelectedEvent(event);
		setModalVisible(true);
	};

	const closeModal = () => {
		setModalVisible(false);
		setSelectedEvent(null);
	};

	const getMeetingLink = (event) => {
		if (!event) return null;
		if (event.hangoutLink) return event.hangoutLink;

		if (event.description) {
			const urlMatch = event.description.match(/https?:\/\/\S+/);
			if (urlMatch) return urlMatch[0];
		}

		if (event.location && event.location.startsWith('http')) {
			return event.location;
		}

		return null;
	};

	const meetingLink = getMeetingLink(selectedEvent);

	const renderEventItem = ({ item }) => {
		const isCancelled = item.status === 'cancelled';
		const organizerName = item.organizer?.displayName || item.organizer?.email || 'Unknown organizer';
		const creatorName = item.creator && item.creator !== item.organizer
			? (item.creator.displayName || item.creator.email)
			: null;
		const attendeesCount = item.attendees?.length || 0;

		return (
			<TouchableOpacity
				style={[styles.eventItem, isCancelled && styles.cancelledEvent]}
				onPress={() => openEventModal(item)}
				activeOpacity={0.7}
			>
				<View style={styles.eventTitleWrapper}>
					<Text style={[styles.eventTitle, isCancelled && styles.cancelledText]}>
						{item.summary || '(No Title)'}
					</Text>
					<View style={styles.timeBadge}>
						<Text style={styles.timeBadgeText}>
							{item.start?.dateTime
								? format(parseISO(item.start.dateTime), 'hh:mm a')
								: 'All day'}
						</Text>
					</View>
				</View>

				<Text style={styles.eventOrganizer}>👤 Organizer: {organizerName}</Text>

				{creatorName && (
					<Text style={styles.eventCreator}>✏️ Created by: {creatorName}</Text>
				)}

				{item.location && (
					<Text style={styles.eventLocation}>📍 {item.location}</Text>
				)}

				{attendeesCount > 0 && (
					<Text style={styles.eventAttendees}>👥 Attendees: {attendeesCount}</Text>
				)}

				{isCancelled && (
					<Text style={styles.eventCancelled}>⚠️ This event was cancelled</Text>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<>
			<CustomHeader2 />
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 120}]}>
				{loading ? (
					<ActivityIndicator size="large" color="#004D1A" style={{ marginTop: 40 }} />
				) : (
					<>
						<Calendar
							style={styles.calendar}
							markedDates={{
								...markedDates,
								...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#FFD04C' } } : {}),
							}}
							onDayPress={(day) => setSelectedDate(day.dateString)}
							theme={{
								selectedDayBackgroundColor: '#FFD04C',
								selectedDayTextColor: '#004D1A',
								todayTextColor: '#FFD04C',
								arrowColor: '#004D1A',
								monthTextColor: '#004D1A',
								textDayFontWeight: '600',
								textMonthFontWeight: '700',
								textDayHeaderFontWeight: '600',
								textDayFontSize: 16,
							}}
						/>

						{selectedDate && eventsForSelectedDate.length === 0 && (
							<Text style={styles.noEventsText}>No events on this date</Text>
						)}

						<FlatList
							data={eventsForSelectedDate}
							keyExtractor={(item) => item.id}
							renderItem={renderEventItem}
							contentContainerStyle={{ paddingBottom: 140 }}
							refreshControl={
								<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#004D1A']} />
							}
						/>

						<Modal
							animationType="slide"
							transparent={true}
							visible={modalVisible}
							onRequestClose={closeModal}
						>
							<View style={globalStyles.overlay}>
								<View style={globalStyles.modalContainer}>
									<Text style={styles.modalTitle}>{selectedEvent?.summary || '(No Title)'}</Text>
									<ScrollView showsVerticalScrollIndicator={false}>
										<Text style={styles.modalTime}>
											{selectedEvent?.start?.dateTime
												? format(parseISO(selectedEvent.start.dateTime), 'EEEE, MMMM d, yyyy hh:mm a')
												: selectedEvent?.start?.date || 'All day'}
										</Text>
										{selectedEvent?.location && (
											<Text style={styles.modalLocation}>📍 {selectedEvent.location}</Text>
										)}
										{selectedEvent?.description && (
											<Text style={styles.modalDescription}>{selectedEvent.description}</Text>
										)}
									</ScrollView>
									{meetingLink && (
										<TouchableOpacity
											style={styles.joinButton}
											onPress={() => Linking.openURL(meetingLink)}
											activeOpacity={0.8}
										>
											<Text style={styles.joinButtonText}>Join Meeting</Text>
										</TouchableOpacity>
									)}
									<Pressable style={styles.closeButton} onPress={closeModal} android_ripple={{ color: '#ccc' }}>
										<Text style={styles.closeButtonText}>Close</Text>
									</Pressable>
								</View>
							</View>
						</Modal>
					</>
				)}
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	header: {
		paddingVertical: 18,
		backgroundColor: '#004D1A',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#FFD04C',
	},
	calendar: {
		marginTop: 10,
		marginHorizontal: 10,
		borderRadius: 8,
		overflow: 'hidden',
	},
	noEventsText: {
		textAlign: 'center',
		fontSize: 16,
		color: '#444',
		padding: 10,
	},
	eventItem: {
		padding: 14,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		backgroundColor: '#fff',
		marginHorizontal: 10,
		marginVertical: 6,
		borderRadius: 6,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	eventTitleWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	eventTitle: {
		fontWeight: 'bold',
		fontSize: 16,
		color: '#004D1A',
		maxWidth: '80%',
	},
	timeBadge: {
		backgroundColor: '#FFD04C',
		borderRadius: 12,
		paddingVertical: 2,
		paddingHorizontal: 8,
	},
	timeBadgeText: {
		color: '#004D1A',
		fontWeight: '700',
		fontSize: 12,
	},
	eventOrganizer: {
		fontSize: 13,
		color: '#666',
		marginTop: 4,
	},
	eventCreator: {
		fontSize: 13,
		color: '#666',
		marginTop: 2,
		fontStyle: 'italic',
	},
	eventLocation: {
		fontSize: 13,
		color: '#444',
		marginTop: 4,
	},
	eventAttendees: {
		fontSize: 13,
		color: '#444',
		marginTop: 4,
	},
	eventCancelled: {
		marginTop: 6,
		fontSize: 13,
		color: 'red',
		fontWeight: 'bold',
	},
	cancelledEvent: {
		backgroundColor: '#f8d7da',
	},
	cancelledText: {
		color: 'red',
		textDecorationLine: 'line-through',
	},
	modalTitle: {
		fontWeight: 'bold',
		fontSize: 20,
		color: '#004D1A',
		marginBottom: 12,
	},
	modalTime: {
		fontSize: 14,
		color: '#333',
		marginBottom: 6,
	},
	modalLocation: {
		fontSize: 14,
		color: '#333',
		marginBottom: 6,
	},
	modalDescription: {
		fontSize: 14,
		color: '#555',
		marginBottom: 12,
	},
	joinButton: {
		backgroundColor: theme.colors.light.primary,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginVertical: 10,
	},
	joinButtonText: {
		color: theme.colors.light.card,
		fontWeight: 'bold',
		fontSize: 16,
	},
	closeButton: {
		paddingVertical: 12,
		alignItems: 'center',
	},
	closeButtonText: {
		color: '#004D1A',
		fontSize: 16,
		fontWeight: '700',
	},
});

export default CalendarScreen;
