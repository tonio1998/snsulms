import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	Text,
	LayoutAnimation,
	Platform,
	UIManager,
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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ClassesScreen = ({ navigation }) => {
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [searchQuery, setSearchQuery] = useState('');
	const [acad, setAcad] = useState(null);
	const [acadRaw, setAcadRaw] = useState(null);
	const debounceTimeout = useRef(null);
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [expandedClass, setExpandedClass] = useState(null);

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

	const fetchClasses = useCallback(async () => {
		if (!acad || !user?.id) return;
		setLoading(true);
		try {
			const filter = {
				page: 1,
				...(searchQuery ? { search: searchQuery } : {}),
				AcademicYear: acad,
			};
			const res = await getMyClasses(filter);
			setClasses(res?.data || []);
		} catch (err) {
			handleApiError(err);
		} finally {
			setLoading(false);
		}
	}, [acad, user?.id, searchQuery]);

	useEffect(() => {
		fetchClasses();
	}, [acad, user?.id]);

	useFocusEffect(
		useCallback(() => {
			if (acad && acadRaw) fetchClasses();
		}, [acad, acadRaw])
	);

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			fetchClasses();
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
						<Text style={styles.sectionText}>{classInfo?.Section}</Text>
						<View style={styles.activityMeta}>
							<CText fontSize={12}>Activities: {totalActivities}</CText>
							<CText fontSize={12} style={{ color: theme.colors.light.primary }}>
								Submitted: {submittedCount} / Assigned: {assignedCount}
							</CText>
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
						<View style={styles.teacherContainer}>
							<Image source={{ uri: avatarUri }} style={styles.avatar} />
							<CText fontStyle="SB" fontSize={12} numberOfLines={1} style={styles.teacherName}>
								{teacher.name}
							</CText>
						</View>
						<TouchableOpacity
							style={styles.viewBtn}
							onPress={() =>
								navigation.navigate('ClassDetails', {
									ClassStudentID: item.ClassStudentID,
									ClassID: classInfo?.ClassID,
								})
							}
						>
							<CText fontSize={14} fontStyle="B" style={{ color: '#fff' }}>
								View Class
							</CText>
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	};

	return (
		<>
			<CustomHeader />
			<SafeAreaView style={globalStyles.safeArea}>
				<View style={styles.container}>
					<View style={styles.searchWrapper}>
						<TextInput
							style={styles.searchInput}
							placeholder="Search classes..."
							placeholderTextColor="#666"
							value={searchQuery}
							onChangeText={handleSearchTextChange}
							returnKeyType="search"
							clearButtonMode="while-editing"
						/>
					</View>
					<ShimmerList
						data={classes}
						loading={loading}
						renderItem={renderClassItem}
						onRefresh={fetchClasses}
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
	container: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 10,
		backgroundColor: '#f8f9fa',
	},
	searchWrapper: {
		marginBottom: 14,
	},
	searchInput: {
		backgroundColor: '#F8F8F8',
		borderRadius: theme.radius.sm,
		paddingVertical: 14,
		paddingHorizontal: 20,
		fontSize: 16,
		color: '#000',
		borderWidth: 1,
		borderColor: '#ccc',
		// elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 30,
		fontSize: 16,
		color: '#888',
	},
	accordionCard: {
		backgroundColor: '#fff',
		borderRadius: theme.radius.sm,
		marginBottom: 18,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: '#e3e3e3',
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 4 },
		// elevation: 3,
	},
	accordionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
	},
	accordionBody: {
		paddingHorizontal: 16,
		paddingBottom: 16,
		borderTopWidth: 1,
		borderTopColor: '#eee',
	},
	courseText: {
		textTransform: 'uppercase',
		color: '#222',
	},
	sectionText: {
		backgroundColor: theme.colors.light.primary,
		color: '#fff',
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 14,
		alignSelf: 'flex-start',
		marginTop: 6,
		textTransform: 'uppercase',
		fontSize: 12,
		fontWeight: '500',
	},
	activityMeta: {
		marginTop: 12,
		gap: 2,
	},
	progressBarContainer: {
		marginTop: 6,
		flexDirection: 'row',
		alignItems: 'center',
	},
	progressBar: {
		flex: 1,
		height: 6,
		backgroundColor: '#e0e0e0',
		borderRadius: 4,
		overflow: 'hidden',
		marginRight: 8,
	},
	progressFill: {
		height: '100%',
		borderRadius: 4,
	},
	percentageText: {
		fontSize: 12,
		color: '#666',
		minWidth: 30,
	},
	teacherContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.light.primary + '11',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 50,
		width: 'auto',
		alignSelf: 'flex-start',
		marginTop: 10,
	},
	avatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
		marginRight: 8,
		backgroundColor: '#ccc',
		borderWidth: 1,
		borderColor: theme.colors.light.primary,
	},
	teacherName: {
		textTransform: 'uppercase',
		flexShrink: 1,
		fontSize: 12,
	},
	viewBtn: {
		marginTop: 14,
		backgroundColor: theme.colors.light.primary,
		paddingVertical: 12,
		alignItems: 'center',
		borderRadius: 10,
	},
});

export default ClassesScreen;
