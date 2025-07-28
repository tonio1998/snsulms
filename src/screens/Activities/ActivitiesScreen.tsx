import React, { useCallback, useContext, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	SafeAreaView,
	StyleSheet,
} from 'react-native';
import { handleApiError } from '../../utils/errorHandler.ts';
import CustomHeader from '../../components/CustomHeader.tsx';
import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { useLoading } from '../../context/LoadingContext.tsx';
import { getAcademicInfo } from '../../utils/getAcademicInfo.ts';
import { getMyActivities } from '../../api/modules/activitiesApi.ts';
import { CText } from '../../components/CText.tsx';
import { formatDate } from '../../utils/dateFormatter';

const ActivitiesScreen = ({ navigation }) => {
	const network = useContext(NetworkContext);
	const { showLoading, hideLoading } = useLoading();

	const [data, setData] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [acad, setAcad] = useState(null);
	const [acadRaw, setAcadRaw] = useState(null);
	const [selectedTab, setSelectedTab] = useState('All');
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
					await fetchActivities(acadStr, acadInfo);
				}
			})();
			return () => {
				isActive = false;
			};
		}, [])
	);

	const fetchActivities = async (currentAcad = acad, currentAcadRaw = acadRaw, query = '') => {
		if (!currentAcad || !currentAcadRaw || loading) return;
		try {
			setLoading(true);
			showLoading('Loading activities...');
			const params = {
				search: query,
				AcademicYear: currentAcad,
			};
			let response = [];
			if (network?.isOnline) {
				const res = await getMyActivities(params);
				response = res ?? [];
				setData(response);
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
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			fetchActivities(acad, acadRaw, text);
		}, 500);
	};

	const handleClearSearch = () => {
		setSearchQuery('');
		fetchActivities(acad, acadRaw, '');
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchActivities();
		setRefreshing(false);
	};

	const handleViewAct = (StudentActivityID, Title, ActivityID) => {
		navigation.navigate('ActivityDetails', { StudentActivityID, Title, ActivityID });
	};

	const renderActivityItem = ({ item }) => (
		<TouchableOpacity
			style={styles.activityItem}
			onPress={() => handleViewAct(item.StudentActivityID, item.Title, item.ActivityID)}
		>
			<CText fontStyle="B" fontSize={16} style={{ marginBottom: 6 }}>{item.Title}</CText>
			{item.Description && <CText fontSize={14} color="#666">{item.Description}</CText>}
			<CText fontSize={15} style={{ marginBottom: 4 }}>Deadline: {formatDate(item.Deadline)}</CText>
			<CText
				fontSize={16}
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

		console.log("filtered", categorized);

		if (filtered.length === 0) return null;

		return (
			<View style={{ marginBottom: 20 }}>
				<CText fontStyle="B" fontSize={17} style={{ marginBottom: 8 }}>
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
			<CustomHeader />
			<SafeAreaView style={globalStyles.safeArea}>
				<View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 10 }}>
					<View style={styles.searchWrapper}>
						<TextInput
							placeholder="Search activities..."
							placeholderTextColor="#666"
							value={searchQuery}
							onChangeText={handleSearchTextChange}
							onSubmitEditing={() => fetchActivities(acad, acadRaw, searchQuery)}
							returnKeyType="search"
							style={styles.searchInput}
						/>
						{searchQuery ? (
							<TouchableOpacity style={styles.clearBtn} onPress={handleClearSearch}>
								<Icon name="close-circle" size={22} color="#666" />
							</TouchableOpacity>
						) : null}
					</View>

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

					{loading ? (
						<ActivityIndicator
							size="large"
							color={theme.colors.light.primary}
							style={{ marginTop: 30 }}
						/>
					) : (
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
					)}
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	activityItem: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 16,
		marginTop: 8,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 2 },
	},
	searchWrapper: {
		position: 'relative',
		marginBottom: 10,
	},
	searchInput: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 20,
		fontWeight: '600',
		fontSize: 16,
		color: '#000',
	},
	clearBtn: {
		position: 'absolute',
		right: 15,
		top: '50%',
		transform: [{ translateY: -11 }],
	},
	tabWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 15,
	},
	tabPill: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 20,
		backgroundColor: '#eee',
	},
	tabPillActive: {
		backgroundColor: theme.colors.light.primary,
	},
});

export default ActivitiesScreen;
