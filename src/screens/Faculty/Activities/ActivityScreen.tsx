import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	ScrollView,
	Modal,
	Animated,
	Easing,
	Dimensions,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { CText } from '../../../components/common/CText.tsx';
import { getActivities } from '../../../api/modules/activitiesApi.ts';
import { formatDate } from '../../../utils/dateFormatter';
import BackHeader from '../../../components/layout/BackHeader.tsx';
import { NetworkContext } from '../../../context/NetworkContext.tsx';
import Icon from 'react-native-vector-icons/Ionicons';

const { height } = Dimensions.get('window');

const ActivityScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const network = useContext(NetworkContext);
	const { showLoading, hideLoading } = useLoading();

	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [actType, setActType] = useState('');
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(height)).current;

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
			navigation.navigate('FetchEnrollment', { ClassID, ActivityTypeID });
		}
	};

	const activityTypes = [
		{ label: 'All', value: '' },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz', value: 3 },
		{ label: 'Exam', value: 4 },
	];

	const fetchActivities = async () => {
		try {
			if (loading) return;
			setLoading(true);
			showLoading('Loading activities...');

			if (!network?.isOnline) return;

			const res = await getActivities({ ClassID });
			const list = res?.data || [];
			handleActTypeFilter(actType, list);
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

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	const handleActTypeFilter = (type, list = activities) => {
		setActType(type);
		const filtered = list.filter(item => item?.ActivityTypeID !== 1);
		const filteredByType = type ? filtered.filter(item => item?.ActivityTypeID == type) : filtered;
		setActivities(filteredByType);
	};

	const handleViewAct = (Title, ActivityID) => {
		navigation.navigate('FacActivityDetails', { Title, ActivityID });
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity key={item.ActivityID} style={styles.card} onPress={() => handleViewAct(item.Title, item.ActivityID)}>
			<View style={{ padding: 16 }}>
				<CText fontSize={16} fontStyle="SB" style={{ color: '#000' }}>{item?.Title}</CText>
				<CText fontSize={14} style={{ color: '#444', marginTop: 4 }}>{item?.Description}</CText>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
					{item?.DueDate && <CText fontSize={12} style={{ color: '#777' }}>Due: {formatDate(item?.DueDate)}</CText>}
					<CText fontSize={12} style={{ color: '#777' }}>Created: {formatDate(item?.created_at, 'relative')}</CText>
				</View>
			</View>
		</TouchableOpacity>
	);

	const renderFilterHeader = () => (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10, marginBottom: 10 }}>
			<View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 20 }}>
				{activityTypes.map((type, idx) => (
					<TouchableOpacity
						key={idx}
						onPress={() => handleActTypeFilter(type.value)}
						style={[styles.filterBtn, actType === type.value && styles.activeFilterBtn]}
					>
						<CText style={{ color: actType === type.value ? '#fff' : '#000' }} fontStyle="SB">{type.label}</CText>
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
								<CText fontStyle="SB" fontSize={16}>Quiz</CText>
							</TouchableOpacity>
							<TouchableOpacity style={styles.option} onPress={() => handleOption('4')}>
								<CText fontStyle="SB" fontSize={16}>Exam</CText>
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
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		paddingVertical: 20,
		paddingHorizontal: 16,
		elevation: 6,
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowOffset: { width: 0, height: -3 },
		shadowRadius: 6,
	},
	option: {
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderColor: '#f0f0f0',
	},
	cancel: {
		marginTop: 18,
		alignItems: 'center',
	},
	card: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 8,
		marginBottom: 12,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.07,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 3,
	},
	filterBtn: {
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: '#f3f4f6',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	activeFilterBtn: {
		backgroundColor: theme.colors.light.primary,
		borderColor: theme.colors.light.primary,
	},
});

export default ActivityScreen;
