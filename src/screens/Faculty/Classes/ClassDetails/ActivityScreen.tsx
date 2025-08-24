import React, { useCallback, useContext, useEffect, useRef, useState, useMemo } from 'react';
import {
	View,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	ScrollView,
	Animated,
	Easing,
	Dimensions,
} from 'react-native';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { useFocusEffect } from '@react-navigation/native';
import { CText } from '../../../../components/common/CText.tsx';
import { formatDate } from '../../../../utils/dateFormatter';
import { NetworkContext } from '../../../../context/NetworkContext.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import { useClass } from '../../../../context/SharedClassContext.tsx';
import DonutProgress from "../../../../components/common/DonutProgress.tsx";
import ActivityIndicator2 from "../../../../components/loaders/ActivityIndicator2.tsx";
import FabMenu from "../../../../components/buttons/FabMenu.tsx";

const { height } = Dimensions.get('window');

const ActivityCard = React.memo(({ item, onPress }) => (
	<TouchableOpacity
		style={[globalStyles.card, { padding: 14 }]}
		onPress={() => onPress(item?.Title, item?.ActivityID)}
		activeOpacity={0.7}
	>
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<CText fontSize={15} fontStyle="SB" numberOfLines={1} ellipsizeMode={'tail'}
				   style={[globalStyles.cardTitle, {width: '85%'}]}>
				{item?.Title}
			</CText>

			<DonutProgress
				percentage={item?.CompletedPercent}
				radius={18}
				strokeWidth={5}
				percentTextSize={11}
				strokeColor={theme.colors.light.warning}
			/>
		</View>

		{item?.Description?.trim() !== '' && (
			<CText
				fontSize={14}
				style={[globalStyles.cardDesc, { marginTop: 6 }]}
				numberOfLines={3}
			>
				{item?.Description}
			</CText>
		)}

		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginTop: 12,
				borderTopWidth: StyleSheet.hairlineWidth,
				borderTopColor: '#ddd',
				paddingTop: 6,
			}}
		>
			{item?.DueDate ? (
				<CText fontSize={12} style={globalStyles.cardMeta}>
					Due: {formatDate(item?.DueDate)}
				</CText>
			) : (
				<CText fontSize={12} style={{ color: '#aaa' }}>
					No due date
				</CText>
			)}

			<CText fontSize={12} style={globalStyles.cardMeta}>
				Created: {formatDate(item?.created_at, 'relative')}
			</CText>
		</View>
	</TouchableOpacity>
));

const ActivityScreen = ({ navigation }) => {
	const { classes, refresh } = useClass();
	const ClassID = classes?.ClassID;

	const network = useContext(NetworkContext);

	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [actType, setActType] = useState('');
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(height)).current;

	const activityTypes = useMemo(() => [
		{ label: 'All', value: '' },
		{ label: 'Assignment', value: 2 },
		{ label: 'Quiz/Exam', value: 3 },
	], []);

	const fetchActivities = useCallback(async () => {
		setLoading(true);
		try {
			// simulate slight delay so loading spinner is visible
			await new Promise(resolve => setTimeout(resolve, 500));

			const res = classes?.activities || [];
			const enriched = res.map(item => {
				const total = item.student_activity?.length || 0;
				const submitted = item.student_activity?.filter(stu => stu.DateSubmitted)?.length || 0;
				return { ...item, CompletedPercent: total ? Math.round((submitted / total) * 100) : 0 };
			});

			setActivities(enriched);
		} catch (err) {
			handleApiError(err, 'Failed to fetch activities');
		} finally {
			setLoading(false);
		}
	}, [classes?.activities, network?.isOnline]);

	useFocusEffect(useCallback(() => {
		fetchActivities();
		console.log("🔍 Fetching activities from API", ClassID);
	}, [fetchActivities]));

	const filteredActivities = useMemo(() => {
		let filtered = activities.filter(act => act?.ActivityTypeID > 1);
		if (actType) {
			filtered = filtered.filter(act => act?.ActivityTypeID == actType);
		}
		return filtered;
	}, [activities, actType]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refresh();
		await fetchActivities();
		setRefreshing(false);
	};

	const handleViewAct = (Title, ActivityID) =>
		navigation.navigate('FacActivityDetails', { Title, ActivityID });

	const handleOption = type => {
		if (type === '2') navigation.navigate('AddActivity', {
			ClassID,
			ActivityTypeID: type,
			ClassInfo: classes,
			onAdded: fetchActivities
		});
		if (type === '3') navigation.navigate('QuizBuilder', {
			ClassID,
			ActivityTypeID: type,
			ClassInfo: classes,
			onAdded: fetchActivities
		});
		if (type === '4') navigation.navigate('OutlineList', { ClassID });
	};

	const renderFilterHeader = () => (
		<>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 14 }}>
				<View style={{ flexDirection: 'row', gap: 10 }}>
					{activityTypes.map((type, idx) => {
						const isActive = actType === type.value;
						return (
							<TouchableOpacity
								key={idx}
								onPress={() => setActType(type.value)}
								style={[styles.filterBtn, isActive && styles.activeFilterBtn]}
							>
								<CText style={{ color: isActive ? '#fff' : '#111', fontSize: 13 }} fontStyle="SB">{type.label}</CText>
							</TouchableOpacity>
						);
					})}
				</View>
			</ScrollView>
			{loading && <ActivityIndicator2 />}
		</>
	);

	return (
		<SafeAreaView style={[globalStyles.safeArea2]}>
			<FlatList
				data={filteredActivities}
				keyExtractor={(item, index) => `${item?.ActivityID}-${index}`}
				renderItem={({ item }) => <ActivityCard item={item} onPress={handleViewAct} />}
				ListHeaderComponent={renderFilterHeader}
				contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
				initialNumToRender={5}
				maxToRenderPerBatch={5}
				removeClippedSubviews
				ListEmptyComponent={!loading && (
					<View style={{ padding: 20, alignItems: 'center' }}>
						<Icon name="list-circle-outline" size={48} color="#ccc" />
						<CText fontSize={14} style={{ color: '#888', marginTop: 10 }}>No activities found</CText>
					</View>
				)}
			/>

			<FabMenu
				fabColor={theme.colors.light.warning}
				fabIcon="add"
				iconColor="#fff"
				iconSize={28}
				radius={80}
				startAngle={200}
				spacingAngle={60}
				fabSize={55}
				options={[
					{
						label: "Assignment",
						color: theme.colors.light.primary,
						icon: "document-text",
						onPress: () => handleOption("2"),
					},
					{
						label: "Quiz/Exam",
						color: theme.colors.light.primary,
						icon: "clipboard",
						onPress: () => handleOption("3"),
					},
				]}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	filterBtn: {
		borderRadius: theme.radius.sm,
		paddingVertical: 8,
		paddingHorizontal: 20,
		backgroundColor: '#fff',
		// borderWidth: 1,
	},
	activeFilterBtn: {
		backgroundColor: theme.colors.light.primary
	},
});

export default ActivityScreen;
