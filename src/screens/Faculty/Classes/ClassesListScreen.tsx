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
	UIManager,
	Clipboard,
	Alert, Modal, Animated, Easing,
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
import { getFacClasses } from '../../../api/modules/classesApi.ts';

const { height } = Dimensions.get('window');

if (Platform.OS === 'android') {
	UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ClassesListScreen = ({ navigation }) => {
	const { showLoading2, hideLoading2 } = useLoading2();
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState('');
	const [acad, setAcad] = useState(null);
	const debounceTimeout = useRef(null);
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [expanded, setExpanded] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(height)).current;

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
			showLoading2('Fetching classes...');
			const filter = {
				page: 1,
				AcademicYear: acad,
			};
			if (searchQuery && searchQuery.trim() !== '') {
				filter.search = searchQuery;
			}
			const res = await getFacClasses(filter);
			setClasses(res?.data ?? []);
		} catch (err) {
			// handleApiError(err, 'Load Classes');
		} finally {
			setLoading(false);
			hideLoading2();
		}
	}, [searchQuery, acad]);

	useEffect(() => {
		if (acad) loadClassesOnline();
	}, [acad, searchQuery]);

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			loadClassesOnline();
		}, 400);
	};

	const handleClearSearch = async () => {
		setSearchQuery('');
		await loadClassesOnline();
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
		if (type === 'manual') {
			navigation.navigate('AddClass');
		} else if (type === 'fetch') {
			navigation.navigate('FetchEnrollment');
		}
	};


	const handleCopy = (text) => {
		Clipboard.setString(text);
	};

	const handleDuplicateClass = (item) => {
		Alert.alert('Duplicate Class', `This would duplicate the class: ${item.CourseCode} - ${item.Section}`);
	};

	const renderClassItem = ({ item }) => {
		const teacher = item?.teacher || {};
		const avatarUri = teacher.avatar
			? teacher.avatar
			: `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name ?? 'User')}`;
		const isExpanded = expanded === item.ClassID;

		return (
			<View style={styles.card}>
				<TouchableOpacity activeOpacity={0.8} onPress={() => toggleAccordion(item.ClassID)}>
					<View style={styles.cardHeader}>
						<View>
							<CText fontStyle="SB" fontSize={15}>{item?.CourseCode}</CText>
							<CText fontStyle="M" fontSize={13} color="#666">{item?.CourseName}</CText>
						</View>
						<Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#888" />
					</View>
				</TouchableOpacity>
				{isExpanded && (
					<View style={styles.expandedContent}>
						<View style={styles.teacherRow}>
							<Image source={{ uri: avatarUri }} style={styles.avatar} />
							<CText fontStyle="M" fontSize={12}>{teacher.name}</CText>
						</View>
						<View style={styles.summaryRow}>
							<View>
								<CText fontStyle='SB' fontSize={20}>{item.activities.length}</CText>
								<CText fontSize={11}>Activities</CText>
							</View>
							<View>
								<CText fontStyle='SB' fontSize={20}>{item.students.length}</CText>
								<CText fontSize={11}>Students</CText>
							</View>
							<TouchableOpacity onPress={() => handleCopy(item.ClassCode)}>
								<View style={{ alignItems: 'center' }}>
									<CText fontStyle='SB' fontSize={20}>{item.ClassCode}</CText>
									<CText fontSize={11}>Class Code</CText>
								</View>
							</TouchableOpacity>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
							<TouchableOpacity
								style={styles.viewButton}
								onPress={() =>
									navigation.navigate('ClassDetails', {
										ClassStudentID: item.ClassStudentID,
										ClassID: item?.ClassID,
									})
								}>
								<CText fontStyle='SB' fontSize={14} style={{ color: theme.colors.light.primary }}>
									View
								</CText>
							</TouchableOpacity>
						</View>
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
					<ShimmerList
						data={classes}
						loading={loading}
						renderItem={renderClassItem}
						keyExtractor={(item) =>
							item.ClassStudentID?.toString() ?? `${item.ClassID}-${Math.random()}`
						}
						onRefresh={loadClassesOnline}
					/>
				</View>

				<TouchableOpacity style={globalStyles.fab} activeOpacity={0.7} onPress={openModal}>
					<Icon name="add" size={28} color="#fff" />
				</TouchableOpacity>

				{showModal && (
					<Modal transparent visible={showModal} animationType="fade">
						<TouchableOpacity style={globalStyles.overlay} activeOpacity={1} onPress={closeModal} />
						<Animated.View style={[globalStyles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
							<TouchableOpacity style={globalStyles.option} onPress={() => handleOption('manual')}>
								<CText fontStyle="SB" fontSize={16}>Add Class</CText>
							</TouchableOpacity>
							{/*<TouchableOpacity style={globalStyles.option} onPress={() => handleOption('fetch')}>*/}
							{/*	<CText fontStyle="SB" fontSize={16}>Import</CText>*/}
							{/*</TouchableOpacity>*/}
							<TouchableOpacity style={globalStyles.cancel} onPress={closeModal}>
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
	container: { flex: 1, padding: 16 },
	searchBox: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: theme.radius.sm,
		paddingHorizontal: 15,
		height: 45,
		backgroundColor: '#f9f9f9',
	},
	searchInput: { flex: 1, height: 40, fontSize: 15, color: '#000' },
	searchIcon: { marginRight: 6 },
	clearIcon: { marginLeft: 6 },
	card: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	expandedContent: {
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#eee',
		paddingTop: 12,
	},
	teacherRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	avatar: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 8,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	viewButton: {
		alignSelf: 'flex-start',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: theme.colors.light.primary,
		borderRadius: 8,
	},
});

export default ClassesListScreen;
