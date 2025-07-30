import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	Modal,
	Animated,
	Easing,
	Dimensions,
	FlatList,
} from 'react-native';
import { handleApiError } from '../../../utils/errorHandler.ts';
import CustomHeader from '../../../components/layout/CustomHeader.tsx';
import { globalStyles } from '../../../theme/styles.ts';
import { CText } from '../../../components/common/CText.tsx';
import { theme } from '../../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { ShimmerList } from '../../../components/loaders/ShimmerList.tsx';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { getAcademicInfo } from '../../../utils/getAcademicInfo.ts';
import { useAuth } from '../../../context/AuthContext.tsx';
import { getFacClasses } from '../../../api/modules/classesApi.ts';

const { height } = Dimensions.get('window');

const ClassesListScreen = ({ navigation }) => {
	const { showLoading, hideLoading } = useLoading();
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState('');
	const [acad, setAcad] = useState(null);
	const [acadRaw, setAcadRaw] = useState(null);
	const debounceTimeout = useRef(null);
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(height)).current;
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(false);

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

	const filter = {
		page: 1,
		...(searchQuery ? { search: searchQuery } : {}),
		AcademicYear: acad,
	};

	const loadClassesOnline = useCallback(async () => {
		try {
			setLoading(true);
			showLoading('Fetching classes...');
			const res = await getFacClasses(filter);
			setClasses(res?.data ?? []);
		} catch (err) {
			handleApiError(err, 'Load Classes');
		} finally {
			setLoading(false);
			hideLoading();
		}
	}, [filter]);

	useEffect(() => {
		if (acad) loadClassesOnline();
	}, [acad]);

	useFocusEffect(
		useCallback(() => {
			if (acad) loadClassesOnline();
		}, [acad])
	);

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			loadClassesOnline();
		}, 500);
	};

	const handleClearSearch = () => {
		setSearchQuery('');
		loadClassesOnline();
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

	const renderFooter = () =>
		loading ? (
			<ActivityIndicator size="large" color={theme.colors.light.primary} style={{ marginVertical: 15 }} />
		) : null;

	const renderClassItem = ({ item }) => {
		const teacher = item?.teacher || {};
		const avatarUri = teacher.avatar
			? teacher.avatar
			: `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name ?? 'User')}&background=random`;

		return (
			<TouchableOpacity
				activeOpacity={0.6}
				onPress={() =>
					navigation.navigate('ClassDetails', {
						ClassStudentID: item.ClassStudentID,
						ClassID: item?.ClassID,
					})
				}
				style={styles.card}
			>
				<View>
					<CText fontStyle="SB" fontSize={14} style={{ textTransform: 'uppercase' }} numberOfLines={2}>
						{item?.CourseCode} - {item?.CourseName}
					</CText>
					<CText fontStyle="SB" fontSize={15} style={{ textTransform: 'uppercase', marginTop: 3 }} numberOfLines={2}>
						{item?.Section}
					</CText>
				</View>

				<View style={styles.teacherContainer}>
					<Image source={{ uri: avatarUri }} style={styles.avatar} />
					<CText fontStyle="SB" numberOfLines={1} fontSize={12} style={{ textTransform: 'uppercase', width: '80%' }}>
						{teacher.name}
					</CText>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<>
			<CustomHeader />
			<SafeAreaView style={globalStyles.safeArea}>
				<View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 10 }}>
					<View style={styles.searchWrapper}>
						<TextInput
							placeholder="Search classes..."
							placeholderTextColor="#666"
							value={searchQuery}
							onChangeText={handleSearchTextChange}
							returnKeyType="search"
							style={styles.searchInput}
							clearButtonMode="while-editing"
						/>
						{searchQuery ? (
							<TouchableOpacity
								style={styles.clearBtn}
								onPress={handleClearSearch}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Icon name="close-circle" size={22} color="#666" />
							</TouchableOpacity>
						) : null}
					</View>

					<ShimmerList
						data={classes}
						loading={loading}
						keyExtractor={(item) => item.ClassStudentID?.toString() ?? `${item.ClassID}-${Math.random()}`}
						renderItem={renderClassItem}
						onRefresh={loadClassesOnline}
						onEndReachedThreshold={0.5}
						ListFooterComponent={renderFooter}
						ListEmptyComponent={
							!loading && (
								<View style={{ paddingVertical: 30 }}>
									<Text style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>No classes found.</Text>
								</View>
							)
						}
					/>
				</View>

				<TouchableOpacity style={globalStyles.fab} activeOpacity={0.7} onPress={openModal}>
					<Icon name="add" size={28} color="#fff" />
				</TouchableOpacity>

				{showModal && (
					<Modal transparent visible={showModal} animationType="none">
						<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal} />
						<Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
							<TouchableOpacity style={styles.option} onPress={() => handleOption('manual')}>
								<CText fontStyle="SB" fontSize={16}>Add Class Manually</CText>
							</TouchableOpacity>
							<TouchableOpacity style={styles.option} onPress={() => handleOption('fetch')}>
								<CText fontStyle="SB" fontSize={16}>Fetch from Enrollment</CText>
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
	searchWrapper: {
		position: 'relative',
		marginBottom: 12,
	},
	searchInput: {
		backgroundColor: '#f9f9f9',
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 16,
		fontWeight: '500',
		fontSize: 15,
		color: '#000',
	},
	clearBtn: {
		position: 'absolute',
		right: 12,
		top: '50%',
		transform: [{ translateY: -11 }],
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 10,
		marginBottom: 10,
		paddingVertical: 12,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: theme.colors.light.primary + '22',
		elevation: 1,
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
	},
	teacherContainer: {
		marginTop: 12,
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 20,
		backgroundColor: theme.colors.light.primary + '1A',
		alignSelf: 'flex-start',
	},
	avatar: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 8,
		backgroundColor: '#ddd',
		borderWidth: 1,
		borderColor: theme.colors.light.primary,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	modalContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: 30,
		paddingTop: 12,
		paddingHorizontal: 24,
	},
	option: {
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderColor: '#eee',
	},
	cancel: {
		marginTop: 20,
		alignItems: 'center',
	},
});

export default ClassesListScreen;