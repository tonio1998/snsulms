import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	Text,
	LayoutAnimation,
	Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import CustomHeader from '../../../components/layout/CustomHeader.tsx';
import { CText } from '../../../components/common/CText.tsx';
import { ShimmerList } from '../../../components/loaders/ShimmerList.tsx';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { getAcademicInfo } from '../../../utils/getAcademicInfo.ts';
import { getMyClasses } from '../../../api/modules/classesApi.ts';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { loadClassesFromLocal, saveClassesToLocal } from "../../../utils/cache/Student/localStudentClassesService";
import { formatDate } from "../../../utils/dateFormatter";
import CustomHeader2 from "../../../components/layout/CustomHeader2.tsx";
import {LastUpdatedBadge} from "../../../components/common/LastUpdatedBadge";
import ActivityIndicator2 from "../../../components/loaders/ActivityIndicator2.tsx";

const ClassesScreen = ({ navigation, route }) => {
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();

	const [searchQuery, setSearchQuery] = useState('');
	const [acad, setAcad] = useState(null);
	const [acadRaw, setAcadRaw] = useState(null);
	const debounceTimeout = useRef(null);

	const [allClasses, setAllClasses] = useState([]);
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [expandedClass, setExpandedClass] = useState(null);
	const [lastFetched, setLastFetched] = useState(null);

	useFocusEffect(
		useCallback(() => {
			let isActive = true;
			(async () => {
				const acadInfo = await getAcademicInfo();
				const acadStr = `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
				if (isActive) {
					setAcad(acadStr);
					setAcadRaw(acadInfo);
				}
			})();
			return () => {
				isActive = false;
			};
		}, [])
	);

	const loadFromCache = useCallback(async () => {
		if (!user?.id) return;
		const { data, date } = await loadClassesFromLocal(user.id);
		if (data) {
			console.log("classes", data);
			setAllClasses(data);
			setClasses(data);
		}
		if (date) setLastFetched(date);
	}, [user?.id]);

	const fetchFromApi = useCallback(async () => {
		if (!acad || !user?.id) return;
		setLoading(true);
		try {
			const filter = {
				page: 1,
				...(searchQuery ? { search: searchQuery } : {}),
				AcademicYear: acad,
				StudentID: user?.conn_id,
			};
			const res = await getMyClasses(filter);

			const sortedClasses = (res?.data || []).sort((a, b) => {
				const aAssigned = a.student_activity?.filter(act => act.SubmissionType === 'Assigned').length || 0;
				const bAssigned = b.student_activity?.filter(act => act.SubmissionType === 'Assigned').length || 0;
				if (aAssigned === 0 && bAssigned !== 0) return 1;
				if (aAssigned !== 0 && bAssigned === 0) return -1;
				return 0;
			});

			setAllClasses(sortedClasses);
			setClasses(sortedClasses);
			const savedTime = await saveClassesToLocal(user.id, sortedClasses);
			if (savedTime) setLastFetched(savedTime);
		} catch (err) {
			handleApiError(err);
		} finally {
			setLoading(false);
		}
	}, [acad, user?.id, user?.conn_id, searchQuery]);

	const handleSearch = (text) => {
		setSearchQuery(text);
		if (!text.trim()) {
			setClasses(allClasses);
		} else {
			const lower = text.toLowerCase();
			const filtered = allClasses.filter(item =>
				item?.class_info?.CourseName?.toLowerCase().includes(lower) ||
				item.teacher?.name?.toLowerCase().includes(lower)
			);
			setClasses(filtered);
		}
	};

	useEffect(() => {
		const loadData = async () => {
			await loadFromCache();
			const { data } = await loadClassesFromLocal(user?.id);
			if (!data) {
				fetchFromApi();
			}
		};
		loadData();
	}, [acad, user?.id]);


	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			loadFromCache();
		}, 500);
	};

	const toggleAccordion = (id) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setExpandedClass((prev) => (prev === id ? null : id));
	};

	const renderClassItem = ({ item }) => {
		const classInfo = item.class_info;
		const teacher = classInfo?.teacher || {};
		const avatarUri =
			teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name || 'User')}&background=random`;
		const isExpanded = expandedClass === item.ClassStudentID;

		const totalActivities = item.student_activity?.length ?? 0;
		const submittedCount = item.student_activity?.filter(a => a.SubmissionType === 'Submitted').length ?? 0;
		const assignedCount = item.student_activity?.filter(a => a.SubmissionType === 'Assigned').length ?? 0;
		const submissionRate = totalActivities > 0 ? (submittedCount / totalActivities) * 100 : 0;

		return (
			<View style={styles.accordionCard}>
				<TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion(item.ClassStudentID)}>
					<View style={{ flex: 1 }}>
						<CText fontStyle="SB" fontSize={16} style={styles.courseText}>
							{classInfo?.CourseCode} - {classInfo?.CourseName}
						</CText>
						<Text style={styles.sectionText}>Section: {classInfo?.Section}</Text>
						<View style={styles.activityMeta}>
							<CText fontSize={12}>Activities: {totalActivities}</CText>
							{/*<CText fontSize={12} style={{ color: theme.colors.light.primary }}>*/}
							{/*	Submitted: {submittedCount} / Assigned: {assignedCount}*/}
							{/*</CText>*/}
							<View style={styles.progressBarContainer}>
								<View style={styles.progressBar}>
									<View
										style={[
											styles.progressFill,
											{ width: `${submissionRate}%`, backgroundColor: theme.colors.light.primary },
										]}
									/>
								</View>
								<Text style={styles.percentageText}>{submissionRate.toFixed(0)}%</Text>
							</View>
						</View>
					</View>
					<Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#444" />
				</TouchableOpacity>

				{isExpanded && (
					<View style={styles.accordionBody}>
						<View style={{
							flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1,
							borderColor: '#eee', padding: 10
						}}>
							<View style={styles.teacherRow}>
								<Image source={{ uri: avatarUri, cache: 'force-cache' }} style={styles.avatar} />
								<View>
									<CText fontStyle="SB" fontSize={15}>{teacher.name}</CText>
									<CText fontSize={13}>{teacher.email}</CText>
								</View>
							</View>
							<View style={styles.teacherRow}>
								<TouchableOpacity
									style={styles.viewButton}
									onPress={() =>
										navigation.navigate('ClassDetails', {
											ClassStudentID: item.ClassStudentID,
											ClassID: item?.ClassID,
										})
									}>
									<CText fontStyle="SB" fontSize={14} style={{ color: theme.colors.light.primary }}>
										View
									</CText>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
			</View>
		);
	};

	return (
		<>
			<CustomHeader2 />
			<SafeAreaView style={globalStyles.safeArea}>
				<View style={styles.container}>
					<View style={styles.searchWrapper}>
						<TextInput
							style={styles.searchInput}
							placeholder="Search classes..."
							placeholderTextColor="#666"
							value={searchQuery}
							onChangeText={handleSearch}
							returnKeyType="search"
							clearButtonMode="while-editing"
						/>
					</View>
					<LastUpdatedBadge
						date={lastFetched}
						onReload={fetchFromApi}
					/>
					{loading && (
						<>
							<ActivityIndicator2 />
						</>
					)}
					<ShimmerList
						data={classes}
						loading={loading}
						renderItem={renderClassItem}
						onRefresh={fetchFromApi}
						keyExtractor={(item) => item.ClassStudentID?.toString() ?? `${item.ClassID}-${Math.random()}`}
						ListEmptyComponent={!loading && <Text style={styles.emptyText}>No classes found.</Text>}
					/>
					<TouchableOpacity style={globalStyles.fab} onPress={() => navigation.navigate('JoinClass')}>
						<Icon name="school" size={28} color="#fff" />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	teacherRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	viewButton: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: theme.radius.sm,
		backgroundColor: theme.colors.light.primary + '18',
	},
	container: {
		flex: 1,
		paddingHorizontal: 12,
		paddingTop: 8,
		backgroundColor: '#f9f9f9',
	},
	searchWrapper: {
		marginBottom: 10,
	},
	searchInput: {
		backgroundColor: '#fff',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		fontSize: 14,
		color: '#000',
		borderWidth: 1,
		borderColor: '#ccc',
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 20,
		fontSize: 14,
		color: '#888',
	},
	accordionCard: {
		backgroundColor: '#fff',
		borderRadius: 8,
		marginBottom: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: '#e1e1e1',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	accordionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
	},
	accordionBody: {
		paddingHorizontal: 10,
		paddingBottom: 10,
		borderTopWidth: 1,
		borderTopColor: '#eee',
	},
	courseText: {
		textTransform: 'uppercase',
		color: '#222',
	},
	sectionText: {
		backgroundColor: theme.colors.light.primary + '18',
		color: theme.colors.light.primary,
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 12,
		alignSelf: 'flex-start',
		marginTop: 4,
		fontSize: 11,
		fontWeight: '600',
	},
	activityMeta: {
		marginTop: 8,
		gap: 2,
	},
	progressBarContainer: {
		marginTop: 4,
		flexDirection: 'row',
		alignItems: 'center',
	},
	progressBar: {
		flex: 1,
		height: 5,
		backgroundColor: '#e0e0e0',
		borderRadius: 4,
		overflow: 'hidden',
		marginRight: 6,
	},
	progressFill: {
		height: '100%',
		borderRadius: 4,
	},
	percentageText: {
		fontSize: 11,
		color: '#666',
		minWidth: 28,
	},
	teacherContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.light.primary + '10',
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 50,
		alignSelf: 'flex-start',
		marginTop: 8,
	},
	avatar: {
		width: 35,
		height: 35,
		borderRadius: 50,
		marginRight: 6,
		backgroundColor: '#ccc',
		borderWidth: 1,
		borderColor: theme.colors.light.primary,
	},
	teacherName: {
		textTransform: 'uppercase',
		flexShrink: 1,
		fontSize: 11,
	},
	viewBtn: {
		marginTop: 10,
		backgroundColor: theme.colors.light.primary,
		paddingVertical: 8,
		alignItems: 'center',
		borderRadius: 8,
	},
});

export default ClassesScreen;
