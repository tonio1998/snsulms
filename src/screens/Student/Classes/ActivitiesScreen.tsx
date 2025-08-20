import React, { useCallback, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	Text,
	TouchableOpacity,
	SafeAreaView,
	StyleSheet,
} from 'react-native';
import { handleApiError } from '../../../utils/errorHandler.ts';
import CustomHeader from '../../../components/layout/CustomHeader.tsx';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { getAcademicInfo } from '../../../utils/getAcademicInfo.ts';
import { getMyActivities } from '../../../api/modules/activitiesApi.ts';
import { CText } from '../../../components/common/CText.tsx';
import { formatDate } from '../../../utils/dateFormatter';
import {
	loadAllStudentActivitiesToLocal,
	saveAllStudentActivitiesToLocal
} from "../../../utils/cache/Student/localStudentActivitiesGroup";
import CustomHeader2 from "../../../components/layout/CustomHeader2.tsx";
import {LastUpdatedBadge} from "../../../components/common/LastUpdatedBadge";
import ActivityIndicator2 from "../../../components/loaders/ActivityIndicator2.tsx";

const ActivitiesScreen = ({ navigation }) => {
	const { showLoading, hideLoading } = useLoading();
	const { user } = useAuth();

	const [allActivities, setAllActivities] = useState([]);
	const [data, setData] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [acad, setAcad] = useState(null);
	const [acadRaw, setAcadRaw] = useState(null);
	const [selectedTab, setSelectedTab] = useState('All');
	const [lastUpdated, setLastUpdated] = useState(null);
	const debounceTimeout = useRef(null);

	useFocusEffect(
		useCallback(() => {
			let isActive = true;
			(async () => {
				const acadInfo = await getAcademicInfo();
				const acadStr = `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
				if (isActive) {
					setAcad(acadStr);
					setAcadRaw(acadInfo);

					const local = await loadAllStudentActivitiesToLocal(user?.id);
					if (local?.data) {
						setAllActivities(local.data);
						setData(local.data);
						setLastUpdated(local.date);
					}

					if (!local?.data) {
						await fetchActivities(acadStr, acadInfo);
					}
				}
			})();
			return () => {
				isActive = false;
			};
		}, [user?.id])
	);

	const fetchActivities = async (
		currentAcad = acad,
		currentAcadRaw = acadRaw,
		query = '',
		forceOnline = false
	) => {
		if (!currentAcad || !currentAcadRaw || loading) return;
		try {
			setLoading(true);
			showLoading('Loading activities...');

			if (!forceOnline && !query) {
				const local = await loadAllStudentActivitiesToLocal(user?.id);
				if (local?.data) {
					setAllActivities(local.data);
					setData(local.data);
					setLastUpdated(local.date);
					setLoading(false);
					hideLoading();
					return;
				}
			}

			const params = {
				search: query,
				AcademicYear: currentAcad,
			};

			const res = await getMyActivities(params);
			setAllActivities(res ?? []);
			setData(res ?? []);

			if (!query) {
				const now = await saveAllStudentActivitiesToLocal(user?.id, res ?? []);
				setLastUpdated(now);
			}
		} catch (err) {
			handleApiError(err, 'Failed to load activities');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (!text) {
			setData(allActivities);
			return;
		}

		const lower = text.toLowerCase();
		const filtered = allActivities
			.map(classItem => ({
				...classItem,
				activities: (classItem.activities || []).filter(act =>
					act.Title?.toLowerCase().includes(lower) ||
					act.Description?.toLowerCase().includes(lower)
				)
			}))
			.filter(classItem => classItem.activities.length > 0);

		setData(filtered);
	};

	const handleClearSearch = () => {
		setSearchQuery('');
		setData(allActivities);
	};

	const handleRefresh = async () => {
		setLoading(true);
		await fetchActivities(acad, acadRaw, '', true);
		setLoading(false);
	};

	const handleViewAct = (StudentActivityID, Title, ActivityID) => {
		navigation.navigate('ActivityDetails', { StudentActivityID, Title, ActivityID });
	};

	const renderActivityItem = ({ item }) => (
		<TouchableOpacity
			style={styles.activityItem}
			onPress={() => handleViewAct(item.StudentActivityID, item.Title, item.ActivityID)}
		>
			<CText fontStyle="B" fontSize={14} style={{ marginBottom: 6 }}>{item.Title}</CText>
			{item.Description && <CText fontSize={14} color="#666">{item.Description}</CText>}
			{item.Deadline && (
				<CText fontSize={15} style={{ marginBottom: 4 }}>
					Deadline: {formatDate(item.Deadline)}
				</CText>
			)}
			<CText
				fontSize={13}
				fontStyle="SB"
				style={{
					color: item.SubmissionType === 'Submitted'
						? theme.colors.light.success
						: theme.colors.light.danger,
				}}
			>
				{item.SubmissionType ?? 'Not Submitted'}{' '}
				{item.DateSubmitted ? `• ${formatDate(item.DateSubmitted)}` : ''}
			</CText>
		</TouchableOpacity>
	);

	const renderSubjectItem = ({ item }) => {
		const now = new Date();
		const all = item.activities || [];

		const categorized = {
			All: all,
			Upcoming: all.filter(a =>
				a.SubmissionType === 'Assigned' &&
				a.Deadline &&
				new Date(a.Deadline) > now
			),
			Due: all.filter(a =>
				a.SubmissionType === 'Assigned' &&
				a.Deadline &&
				new Date(a.Deadline) <= now
			),
			Completed: all.filter(a =>
				a.SubmissionType === 'Submitted'
			),
		};

		const filtered = categorized[selectedTab] || [];

		if (filtered.length === 0) return null;

		return (
			<View style={{ marginBottom: 20 }}>
				<CText fontStyle="B" fontSize={15} style={{ marginBottom: 8 }}>
					{item.CourseCode} - {item.CourseName}
				</CText>
				{filtered.map((act, idx) => (
					<View key={idx}>{renderActivityItem({ item: act })}</View>
				))}
			</View>
		);
	};

	return (
		<>
			<SafeAreaView style={globalStyles.safeArea2}>
				<View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 10 }}>
					<View style={styles.searchWrapper}>
						<TextInput
							placeholder="Search activities..."
							placeholderTextColor="#666"
							value={searchQuery}
							onChangeText={handleSearchTextChange}
							returnKeyType="search"
							style={styles.searchInput}
						/>
						{searchQuery ? (
							<TouchableOpacity style={styles.clearBtn} onPress={handleClearSearch}>
								<Icon name="close-circle" size={22} color="#666" />
							</TouchableOpacity>
						) : null}
					</View>

					<LastUpdatedBadge
						date={lastUpdated}
						onReload={handleRefresh}
					/>

					{!searchQuery && (
						<View style={styles.tabWrapper}>
							{['All', 'Upcoming', 'Completed', 'Due'].map((tab) => (
								<TouchableOpacity
									key={tab}
									style={[
										styles.tabPill,
										selectedTab === tab && styles.tabPillActive,
									]}
									onPress={() => setSelectedTab(tab)}
								>
									<CText
										fontSize={13}
										fontStyle="SB"
										style={{
											color: selectedTab === tab ? '#fff' : '#333',
										}}
									>
										{tab}
									</CText>
								</TouchableOpacity>
							))}
						</View>
					)}
					{loading && (
						<>
							<ActivityIndicator2 />
						</>
					)}
					<FlatList
						data={data}
						keyExtractor={(item, index) => item.ClassID?.toString() ?? index.toString()}
						renderItem={renderSubjectItem}
						refreshing={refreshing}
						onRefresh={handleRefresh}
						ListEmptyComponent={
							<Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>
								No activities found.
							</Text>
						}
					/>
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	activityItem: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 12,
		marginTop: 6,
		borderWidth: 1,
		borderColor: '#eee',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
	},
	searchWrapper: {
		position: 'relative',
		marginBottom: 8,
	},
	searchInput: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		fontSize: 14,
		color: '#000',
	},
	clearBtn: {
		position: 'absolute',
		right: 10,
		top: '50%',
		transform: [{ translateY: -11 }],
	},
	tabWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	tabPill: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 20,
		backgroundColor: '#eee',
	},
	tabPillActive: {
		backgroundColor: theme.colors.light.primary,
	},
});

export default ActivitiesScreen;
