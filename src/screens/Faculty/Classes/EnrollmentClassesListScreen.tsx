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
	Platform,
	Clipboard,
	Alert,
	Modal,
	Animated,
	Easing,
	Text,
	FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { handleApiError } from '../../../utils/errorHandler.ts';
import CustomHeader from '../../../components/layout/CustomHeader.tsx';
import { globalStyles } from '../../../theme/styles.ts';
import { CText } from '../../../components/common/CText.tsx';
import { theme } from '../../../theme';
import { ShimmerList } from '../../../components/loaders/ShimmerList.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useLoading2 } from '../../../context/Loading2Context.tsx';
import { getAcademicInfo } from '../../../utils/getAcademicInfo.ts';
import {LastUpdatedBadge} from "../../../components/common/LastUpdatedBadge";
import {useLoading} from "../../../context/LoadingContext.tsx";
import {
	loadEnrollmentClassesToLocal,
	saveEnrollmentClassesToLocal
} from "../../../utils/cache/Faculty/localEnrollmentClasses";
import {loadEnrollmentClasses} from "../../../api/modules/enrollmentApi.ts";
import BackHeader from "../../../components/layout/BackHeader.tsx";

const { height } = Dimensions.get('window');

const EnrollmentClassesListScreen = ({ navigation, route }) => {
	const { showLoading2, hideLoading2 } = useLoading2();
	const { user } = useAuth();

	console.log('🔍 Fetching classes from API', route);

	const [searchQuery, setSearchQuery] = useState('');
	const { showLoading, hideLoading } = useLoading();
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

	const handleUse = (item) => {
		navigation.navigate('AddClass', { enrollmentdata: item });
	};

	const loadClassesOnline = useCallback(async () => {
		try {
			setLoading(true);
			showLoading('Fetching classes...');
			const filter = {
				page: 1,
				AcademicYear: acad,
			};

			const res = await loadEnrollmentClasses(filter);
			const data = res?.data ?? [];
			setAllClasses(data);
			setFilteredClasses(data);

			const now = await saveEnrollmentClassesToLocal(user?.id, data);
			setLastFetched(now);
		} catch (err) {
			handleApiError(err);
		} finally {
			setLoading(false);
			hideLoading();
		}
	}, [acad]);

	const loadFromCache = async () => {
		try {
			setLoading(true);
			showLoading2('Loading classes...');
			const { data, date } = await loadEnrollmentClassesToLocal(user?.id);
			if (data) {
				console.log("🔍 Fetched classes from cache", data);
				setAllClasses(data);
				setFilteredClasses(data);
				setLastFetched(date);
			} else {
				await loadClassesOnline();
			}
		} catch (err) {
			await loadClassesOnline();
		} finally {
			setLoading(false);
			hideLoading2();
		}
	};

	useEffect(() => {
		if (acad) loadFromCache();
	}, [acad]);

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (!text.trim()) {
			setFilteredClasses(allClasses);
		} else {
			const lower = text.toLowerCase();
			const filtered = allClasses.filter(
				(item) =>
					item?.CourseName?.toLowerCase().includes(lower) ||
					item.teacher?.name?.toLowerCase().includes(lower)
			);
			setFilteredClasses(filtered);
		}
	};

	const handleClearSearch = () => {
		setSearchQuery('');
		setFilteredClasses(allClasses);
	};

	const toggleAccordion = (id) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setExpanded((prev) => (prev === id ? null : id));
	};

	const handleCopy = (text) => {
		Clipboard.setString(text);
	};

	const renderClassItem = ({ item }) => {
		const teacher = item?.creator || {};
		const avatarUri = teacher.avatar
			? teacher.avatar
			: `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name ?? 'User')}`;
		const isExpanded = expanded === item.ClassID;

		return (
			<TouchableOpacity activeOpacity={0.8} onPress={() => toggleAccordion(item.ClassID)}>
			<View style={styles.card}>
					<View style={styles.cardHeader}>
						<View>
							<CText fontStyle="SB" fontSize={15}>
								{item?.course?.CourseCode}
							</CText>
							<View style={{ maxWidth: '90%', width: 300}}>
								<CText fontSize={13} numberOfLines={1} style={{ width: '110%' }}>
									{item?.course?.Description}
								</CText>
							</View>
							<Text style={styles.sectionText}>Section: {item?.SectionCode}</Text>
						</View>
						<Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#888" />
					</View>
				{isExpanded && (
					<View style={styles.expandedContent}>
						<View style={{
							flexDirection: 'row', justifyContent: 'space-between',
							alignItems: 'center', borderTopWidth: 1,
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
									onPress={() => handleUse(item)}
								>
									<CText fontStyle="SB" fontSize={14} style={{ color: theme.colors.light.primary }}>
										Use
									</CText>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
			</View>
			</TouchableOpacity>
		);
	};

	return (
		<>
			<BackHeader title="Enrollment Classes" />
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 100}]}>
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
							<TouchableOpacity onPress={handleClearSearch} style={styles.clearIcon}>
								<Icon name="close-circle" size={18} color="#aaa" />
							</TouchableOpacity>
						)}
					</View>

					<LastUpdatedBadge
						date={lastFetched}
						onReload={loadClassesOnline}
					/>

					<ShimmerList
						data={filteredClasses}
						loading={loading}
						renderItem={renderClassItem}
						keyExtractor={(item) =>
							item.ClassStudentID?.toString() ?? `${item.ClassID}-${Math.random()}`
						}
						onRefresh={loadClassesOnline}
					/>
				</View>
			</SafeAreaView>
		</>
	);
};

export default EnrollmentClassesListScreen;

const styles = StyleSheet.create({
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
	container: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 12,
	},
	searchBox: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#ccc',
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		height: 42,
		color: '#000',
	},
	clearIcon: {
		marginLeft: 8,
	},
	card: {
		backgroundColor: 'white',
		borderRadius: 5,
		padding: 12,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		borderWidth: 1,
		borderColor: '#e1e1e1',
		// elevation: 2,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	expandedContent: {
		marginTop: 10,
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 10,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 12,
	},
	teacherRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	viewButton: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: theme.colors.light.primary + '33',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	modalContent: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: 'white',
		padding: 16,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
	},
	modalOption: {
		paddingVertical: 12,
		alignItems: 'center',
	},
});
