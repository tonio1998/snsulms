import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	ScrollView,
	Modal,
	Animated,
	Easing,
	Dimensions, ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { useFocusEffect } from '@react-navigation/native';
import { CText } from '../../../../components/common/CText.tsx';
import { formatDate } from '../../../../utils/dateFormatter';
import BackHeader from '../../../../components/layout/BackHeader.tsx';
import { NetworkContext } from '../../../../context/NetworkContext.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import { useClass } from '../../../../context/SharedClassContext.tsx';
import { useLoading2 } from '../../../../context/Loading2Context.tsx';

const { height } = Dimensions.get('window');

const ActivityScreen = ({ navigation }) => {
	const { classes, refresh } = useClass();
	const ClassID = classes?.ClassID;

	const network = useContext(NetworkContext);
	const { showLoading2, hideLoading2 } = useLoading2();

	const [activities, setActivities] = useState([]);
	const [activity, setActivity] = useState(null);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [actType, setActType] = useState('');
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(height)).current;
	const [lastFetched, setLastFetched] = useState(null);

	useFocusEffect(
		useCallback(() => {
			refresh();
		}, [refresh])
	);

	const openModal = () => {
		setShowModal(true);
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true,
		}).start();
	};

	const closeModal = () => {
		Animated.timing(slideAnim, {
			toValue: height,
			duration: 250,
			useNativeDriver: true,
		}).start(() => setShowModal(false));
	};

	const handleOption = (type) => {
		closeModal();
		const ActivityTypeID = type;
		if (type === '2') {
			navigation.navigate('AddActivity', { ClassID, ActivityTypeID });
		} else if (type === '3') {
			navigation.navigate('QuizBuilder', { ClassID, ActivityTypeID });
		}
	};

	const activityTypes = [
		{ label: 'All', value: '' },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz/Exam', value: 3 },
		// { label: 'Exam', value: 4 },
	];

	const fetchActivities = async () => {
		try {
			if (loading) return;
			showLoading2('Loading activities...');
			if (!network?.isOnline) return;

			const res = classes?.activities;
			const list = res || [];

			const enriched = list.map(item => {
				const total = item.student_activity?.length || 0;
				const submitted = item.student_activity?.filter(stu => stu.DateSubmitted)?.length || 0;
				const CompletedPercent = total === 0 ? 0 : Math.round((submitted / total) * 100);
				return {
					...item,
					CompletedPercent,
				};
			});

			handleActTypeFilter(actType, enriched);
			setActivity(enriched);
		} catch (err) {
			handleApiError(err, 'Failed to fetch activities');
		} finally {
			setLoading(false);
			hideLoading2();
		}
	};

	useEffect(() => {
		if (ClassID) fetchActivities();
	}, [ClassID]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	const handleActTypeFilter = (type, list = activities) => {
		setActType(type);
		if(type > 0){
			const filtered = list.filter(item => item?.ActivityTypeID !== 1);
			const filteredByType = type ? filtered.filter(item => item?.ActivityTypeID == type) : filtered;
			setActivities(filteredByType);
		}else{
			setActivities(activity);
			console.log("No filter", activity);
		}
	};

	const handleViewAct = (Title, ActivityID) => {
		navigation.navigate('FacActivityDetails', { Title, ActivityID });
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity
			key={item.ActivityID}
			style={styles.card}
			onPress={() => handleViewAct(item.Title, item.ActivityID)}
		>
			<View style={styles.cardInner}>
				<CText fontSize={17} fontStyle="SB" style={styles.cardTitle}>
					{item?.Title}
				</CText>

				{item?.Description?.trim() !== '' && (
					<CText fontSize={14} style={styles.cardDesc}>
						{item?.Description}
					</CText>
				)}

				<View style={styles.progressSection}>
					<Icon name="checkmark-done" size={16} color={theme.colors.light.primary} />
					<CText fontSize={13} style={styles.percentText}>
						{item?.CompletedPercent || 0}% completed
					</CText>
				</View>

				<View style={styles.cardFooter}>
					{item?.DueDate && (
						<CText fontSize={12} style={styles.cardMeta}>
							Due: {formatDate(item?.DueDate)}
						</CText>
					)}
					<CText fontSize={12} style={styles.cardMeta}>
						Created: {formatDate(item?.created_at, 'relative')}
					</CText>
				</View>
			</View>
		</TouchableOpacity>
	);

	const renderFilterHeader = () => (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 14 }}>
			<View style={{ flexDirection: 'row', gap: 10 }}>
				{activityTypes.map((type, idx) => {
					const isActive = actType === type.value;
					return (
						<TouchableOpacity
							key={idx}
							onPress={() => handleActTypeFilter(type.value)}
							style={[
								styles.filterBtn,
								isActive && styles.activeFilterBtn,
								{ backgroundColor: isActive ? theme.colors.light.primary : '#f3f4f6' },
							]}>
							<CText
								style={{
									color: isActive ? '#fff' : '#111',
									fontSize: 13,
								}}
								fontStyle="SB"
							>
								{type.label}
							</CText>
						</TouchableOpacity>
					);
				})}
			</View>
		</ScrollView>
	);

	return (
		<>
			<BackHeader title="Activities" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
				<FlatList
					data={activities}
					keyExtractor={(item) => item.ActivityID.toString()}
					renderItem={renderItem}
					ListHeaderComponent={renderFilterHeader}
					contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					ListEmptyComponent={
						!loading && (
							<View style={{ padding: 20, alignItems: 'center' }}>
								<CText fontSize={14} style={{ color: '#888' }}>No activities found</CText>
							</View>
						)
					}
				/>
				<TouchableOpacity style={globalStyles.fab} activeOpacity={0.7} onPress={openModal}>
					<Icon name="add" size={28} color="#fff" />
				</TouchableOpacity>
				{showModal && (
					<Modal transparent visible={showModal} animationType="none">
						<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal} />
						<Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
							<TouchableOpacity style={styles.option} onPress={() => handleOption('2')}>
								<CText fontStyle="SB" fontSize={16}>Assignment</CText>
							</TouchableOpacity>
							<TouchableOpacity style={styles.option} onPress={() => handleOption('3')}>
								<CText fontStyle="SB" fontSize={16}>Quiz/Exam</CText>
							</TouchableOpacity>
							<TouchableOpacity style={styles.cancel} onPress={closeModal}>
								<CText fontStyle="SB" fontSize={15} style={{ color: '#ff5555' }}>Cancel</CText>
							</TouchableOpacity>
						</Animated.View>
					</Modal>
				)}
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	modalContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingVertical: 24,
		paddingHorizontal: 20,
		elevation: 8,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: -4 },
		shadowRadius: 10,
	},
	option: {
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderColor: '#e5e7eb',
	},
	cancel: {
		marginTop: 22,
		alignItems: 'center',
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: theme.radius.xs,
		padding: 0,
		marginBottom: 14,
		elevation: 1,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	cardInner: {
		padding: 16,
	},
	cardTitle: {
		color: '#111',
	},
	cardDesc: {
		color: '#555',
		marginTop: 6,
		lineHeight: 20,
	},
	cardFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 12,
	},
	cardMeta: {
		color: '#888',
	},
	filterBtn: {
		borderRadius: theme.radius.xs,
		paddingVertical: 8,
		paddingHorizontal: 18,
		// borderWidth: 1,
		borderColor: '#d1d5db',
	},
	activeFilterBtn: {
		borderColor: theme.colors.light.primary,
	},
	progressSection: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
		backgroundColor: '#f3f4f6',
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: theme.radius.xs,
		alignSelf: 'flex-start',
		gap: 6,
	},
	percentText: {
		color: '#111',
	},
});

export default ActivityScreen;
