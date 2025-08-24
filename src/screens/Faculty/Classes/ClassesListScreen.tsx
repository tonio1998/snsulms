import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
	View,
	TextInput,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	Dimensions,
	LayoutAnimation,
	Clipboard,
	Animated,
	Easing,
	Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { globalStyles } from '../../../theme/styles.ts';
import { CText } from '../../../components/common/CText.tsx';
import { theme } from '../../../theme';
import { ShimmerList } from '../../../components/loaders/ShimmerList.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { getAcademicInfo } from '../../../utils/getAcademicInfo.ts';
import { getFacClasses } from '../../../api/modules/classesApi.ts';
import {
	loadFacClassesFromLocal,
	saveFacClassesToLocal,
} from '../../../utils/cache/Faculty/localClasses';
import { LastUpdatedBadge } from '../../../components/common/LastUpdatedBadge';
import ActivityIndicator2 from '../../../components/loaders/ActivityIndicator2.tsx';
import OptionModal from '../../../components/OptionModal.tsx';

const { height } = Dimensions.get('window');

const ClassesListScreen = ({ navigation }) => {
	const { user } = useAuth();

	const [searchQuery, setSearchQuery] = useState('');
	const [acad, setAcad] = useState(null);
	const [allClasses, setAllClasses] = useState([]);
	const [filteredClasses, setFilteredClasses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [expanded, setExpanded] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(height)).current;
	const [lastFetched, setLastFetched] = useState(null);

	useFocusEffect(
		useCallback(() => {
			let isActive = true;
			(async () => {
				const acadInfo = await getAcademicInfo();
				const acadStr = `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
				if (isActive) setAcad(acadStr);
			})();
			return () => (isActive = false);
		}, [])
	);

	const loadClassesOnline = useCallback(async () => {
		try {
			setLoading(true);
			const res = await getFacClasses({ page: 1, AcademicYear: acad });
			const data = res?.data ?? [];
			setAllClasses(data);
			setFilteredClasses(data);
			const now = await saveFacClassesToLocal(user?.id, data, acad);
			setLastFetched(now);
		} catch (err) {
			handleApiError(err);
		} finally {
			setLoading(false);
		}
	}, [acad]);

	const loadFromCache = async () => {
		try {
			setLoading(true);
			const { data, date } = await loadFacClassesFromLocal(user?.id, acad);
			if (data) {
				setAllClasses(data);
				setFilteredClasses(data);
				setLastFetched(date);
			} else {
				await loadClassesOnline();
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (acad) loadFromCache();
	}, [acad]);

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (!text.trim()) return setFilteredClasses(allClasses);
		const lower = text.toLowerCase();
		const filtered = allClasses.filter(
			(item) =>
				item?.CourseName?.toLowerCase().includes(lower) ||
				item?.CourseCode?.toLowerCase().includes(lower) ||
				item.teacher?.name?.toLowerCase().includes(lower)
		);
		setFilteredClasses(filtered);
	};

	const toggleAccordion = (id) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setExpanded((prev) => (prev === id ? null : id));
	};

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
		if (type === 'manual') navigation.navigate('AddClass');
		if (type === 'fetch') navigation.navigate('FetchEnrollment');
	};

	const handleCopy = (text) => Clipboard.setString(text);

	const renderClassItem = ({ item }) => {
		if (!item?.CourseName && !item?.CourseCode) return null;

		const {
			ClassID,
			ClassCode,
			ClassStudentID,
			CourseName,
			CourseCode,
			Section,
			activities = [],
			students = [],
			ClassEnrollmentID,
			teacher = {},
		} = item;

		const isExpanded = expanded === ClassID;
		const avatarUri = teacher.avatar
			? teacher.avatar
			: `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name ?? 'User')}`;

		const handleViewClass = () => {
			navigation.navigate('ClassDetails', { ClassStudentID, ClassID });
		};

		return (
			<TouchableOpacity
				activeOpacity={0.9}
				onPress={() => toggleAccordion(ClassID)}
			>
				<View style={globalStyles.card}>
					<View style={styles.cardHeader}>
						<View style={{ flex: 1, paddingRight: 8 }}>
							<CText fontStyle="SB" fontSize={16} style={{ marginBottom: 2 }}>
								{CourseCode || 'N/A'}
							</CText>
							<CText fontSize={14} numberOfLines={1} style={{ color: '#555' }}>
								{CourseName || 'Untitled Course'}
							</CText>
							{Section && (
								<Text style={styles.sectionText}>Section {Section}</Text>
							)}
						</View>
						<Icon
							name={isExpanded ? 'chevron-up' : 'chevron-down'}
							size={22}
							color={theme.colors.light.primary}
						/>
					</View>

					{isExpanded && (
						<View style={styles.expandedContent}>

							<View style={styles.summaryRow}>
								<SummaryBox label="Activities" value={activities.length} />
								<SummaryBox label="Students" value={students.length} />
								<TouchableOpacity onPress={() => handleCopy(ClassCode)}>
									<SummaryBox label="Class Code" value={ClassCode} />
								</TouchableOpacity>
							</View>

							<View style={styles.teacherContainer}>
								<View style={styles.teacherRow}>
									<Image
										source={{ uri: avatarUri, cache: 'force-cache' }}
										style={styles.avatar}
									/>
									<View>
										<CText fontStyle="SB" fontSize={15} numberOfLines={1}>
											{teacher.name || 'Unknown Teacher'}
										</CText>
										{teacher.email && (
											<CText fontSize={12} style={{ color: '#666', marginTop: 1 }}>
												{teacher.email}
											</CText>
										)}
									</View>
								</View>
								<View>
									<TouchableOpacity
										style={styles.viewButton}
										onPress={handleViewClass}
									>
										<CText fontStyle="SB" fontSize={14} style={{ color: theme.colors.light.primary }}>
											View
										</CText>
									</TouchableOpacity>
								</View>
							</View>


							{ClassEnrollmentID && (
								<CText fontSize={12} style={styles.enrollmentLabel}>
									Imported from Enrollment
								</CText>
							)}
						</View>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	const SummaryBox = ({ label, value }) => (
		<View style={styles.summaryBox}>
			<CText fontStyle="SB" fontSize={20}>{value}</CText>
			<CText fontSize={12} style={styles.summaryLabel}>{label}</CText>
		</View>
	);


	return (
		<SafeAreaView style={globalStyles.safeArea2}>
			<View style={styles.container}>
				<View style={styles.searchBox}>
					<Icon name="search-outline" size={18} color="#999" style={styles.searchIcon} />
					<TextInput
						placeholder="Search classes..."
						value={searchQuery}
						onChangeText={handleSearchTextChange}
						style={styles.searchInput}
						placeholderTextColor="#aaa"
					/>
					{searchQuery !== '' && (
						<TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
							<Icon name="close-circle" size={18} color="#aaa" />
						</TouchableOpacity>
					)}
				</View>

				{loading && <ActivityIndicator2 />}

				<ShimmerList
					data={filteredClasses}
					loading={loading}
					renderItem={renderClassItem}
					keyExtractor={(item) => item.ClassStudentID?.toString() ?? `${item.ClassID}-${Math.random()}`}
					onRefresh={loadClassesOnline}
				/>
			</View>

			<TouchableOpacity style={globalStyles.fab} activeOpacity={0.7} onPress={openModal}>
				<Icon name="add" size={24} color="white" />
			</TouchableOpacity>

			<OptionModal
				visible={showModal}
				onClose={closeModal}
				options={[
					{ label: 'Add Class', value: 'manual' },
					{ label: 'Import', value: 'fetch' },
				]}
				onSelect={(value) => handleOption(value)}
			/>
		</SafeAreaView>
	);
};

export default ClassesListScreen;

const styles = StyleSheet.create({
	sectionText: {
		backgroundColor: theme.colors.light.primary + '15',
		color: theme.colors.light.primary,
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 10,
		alignSelf: 'flex-start',
		marginTop: 4,
		fontSize: 11,
		fontWeight: '600',
	},
	container: {
		flex: 1,
		paddingHorizontal: 15,
		paddingTop: 12,
	},
	searchBox: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 10,
		paddingHorizontal: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		height: 44,
		color: '#000',
		fontSize: 14,
	},
	clearIcon: {
		marginLeft: 8,
	},
	card: {
		backgroundColor: 'white',
		borderRadius: theme.radius.md,
		padding: 14,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 5,
		borderWidth: 1,
		borderColor: '#eee',
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	expandedContent: {
		marginTop: 12,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 14,
	},
	summaryBox: {
		alignItems: 'center',
		flex: 1,
	},
	summaryLabel: {
		color: '#666',
		marginTop: 2,
	},
	teacherRow: {
		flexDirection: 'row',
		// alignItems: 'center',
	},
	teacherContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderTopWidth: 1,
		borderColor: '#f0f0f0',
		paddingTop: 10,
	},
	viewButton: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: theme.radius.sm,
		backgroundColor: theme.colors.light.primary + '20',
	},
	enrollmentLabel: {
		color: '#777',
		marginTop: 8,
		fontStyle: 'italic',
	},
});
