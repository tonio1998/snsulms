import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
	View,
	TextInput,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	Text, Animated, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import CustomHeader from '../../../components/layout/CustomHeader.tsx';
import { CText } from '../../../components/common/CText.tsx';
import { ShimmerList } from '../../../components/loaders/ShimmerList.tsx';

import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import {CACHE_REFRESH, FILE_BASE_URL} from '../../../../env.ts';

import { handleApiError } from '../../../utils/errorHandler.ts';
import { getAcademicInfo } from '../../../utils/getAcademicInfo.ts';
import { getOfflineClasses, saveClassesOffline } from '../../../utils/sqlite/offlineClassesService.ts';

import {getMyClasses, getFacClassesVersion, getFacClasses, getClassesVersion} from '../../../api/modules/classesApi.ts';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { NetworkContext } from '../../../context/NetworkContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
const { height } = Dimensions.get('window');
const dedupeClasses = (list) => {
	const seen = new Set();
	return list.filter((item) => {
		const key = `${item.ClassID}-${item.Section}-${item.CourseCode}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
};

let lastVersionCheck = 0;
let lastVersionResult = null;
const ClassesScreen = ({ navigation }) => {
	const network = useContext(NetworkContext);
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

	const offlineFilter = {
		Semester: acadRaw?.semester,
		AYFrom: acadRaw?.from,
		AYTo: acadRaw?.to,
		UserID: user?.id,
		...(searchQuery ? { search: searchQuery } : {}),
	};

	const getCachedFacClassesVersion = async (filter) => {
		const now = Date.now();
		if (lastVersionCheck && now - lastVersionCheck < CACHE_REFRESH) {
			return lastVersionResult;
		}
		try {
			const version = await getClassesVersion(filter);
			lastVersionCheck = now;
			lastVersionResult = version;
			return version;
		} catch (err) {
			console.warn('⚠️ Version check failed:', err.message);
			return null;
		}
	};

	const loadCachedThenCheckVersion = useCallback(async () => {
		const local = await getOfflineClasses(offlineFilter);
		setClasses(dedupeClasses(local?.data ?? []));
		if (network?.isOnline) {
			const version = await getCachedFacClassesVersion(filter);
			if (!version) return;
			const isOutdated = version?.last_updated !== local?.updatedAt;
			if (isOutdated) {
				try {
					const res = await getMyClasses(filter);
					const fresh = res?.data ?? [];
					await saveClassesOffline(user?.id, fresh, {
						from: acadRaw?.from,
						to: acadRaw?.to,
						semester: acadRaw?.semester,
						updatedAt: version?.last_updated || new Date().toISOString(),
					});
					setClasses(dedupeClasses(fresh));
				} catch (err) {
					if (err?.response?.status === 429) {
						console.warn("🚫 Too Many Requests. Skipping remote fetch.");
						return;
					}
					console.error("🔥 Failed to fetch classes:", err);
				}
			}
		}
	}, [acad, acadRaw, filter, searchQuery, offlineFilter, network?.isOnline, user?.id]);

	useEffect(() => {
		loadCachedThenCheckVersion();
	}, []);

	useFocusEffect(
		useCallback(() => {
			if (acad && acadRaw) loadCachedThenCheckVersion();
		}, [])
	);
	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			loadCachedThenCheckVersion();
		}, 500);
	};


	const handleClearSearch = () => {
		setSearchQuery('');
		loadCachedThenCheckVersion();
	};

	const renderClassItem = ({ item }) => {
		const classInfo = item.class_info;
		const teacher = classInfo?.teacher || {};
		const avatarUri =
			teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name || 'User')}&background=random`;

		return (
			<TouchableOpacity
				style={styles.card}
				activeOpacity={0.7}
				onPress={() =>
					navigation.navigate('ClassDetails', {
						ClassStudentID: item.ClassStudentID,
						ClassID: classInfo?.ClassID,
					})
				}
			>
				<CText fontStyle="SB" fontSize={14} style={styles.courseText} numberOfLines={2}>
					{classInfo?.CourseCode} - {classInfo?.CourseName}
				</CText>
				<CText fontStyle="SB" fontSize={15} style={styles.sectionText} numberOfLines={2}>
					{classInfo?.Section}
				</CText>

				<View style={styles.teacherContainer}>
					<Image source={{ uri: avatarUri }} style={styles.avatar} />
					<CText fontStyle="SB" fontSize={12} numberOfLines={1} style={styles.teacherName}>
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
				<View style={styles.container}>
					{/* Search */}
					<View style={styles.searchWrapper}>
						<TextInput
							style={styles.searchInput}
							placeholder="Search classes..."
							placeholderTextColor="#666"
							value={searchQuery}
							onChangeText={handleSearchTextChange}
							returnKeyType="search"
							clearButtonMode="while-editing"
							onSubmitEditing={() => fetchClasses(1)}
						/>
						{searchQuery ? (
							<TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn} hitSlop={10}>
								<Icon name="close-circle" size={22} color="#666" />
							</TouchableOpacity>
						) : null}
					</View>

					<ShimmerList
						data={classes}
						loading={loading}
						keyExtractor={(item) => item.ClassStudentID?.toString() ?? `${item.ClassID}-${Math.random()}`}
						renderItem={renderClassItem}
						onRefresh={loadCachedThenCheckVersion}
						onEndReachedThreshold={0.5}
						ListEmptyComponent={
							!loading && (
								<View style={{ paddingVertical: 30 }}>
									<Text style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>No classes found.</Text>
								</View>
							)
						}
					/>

					{/* FAB */}
					<TouchableOpacity style={globalStyles.fab} activeOpacity={0.7} onPress={() => navigation.navigate('JoinClass')}>
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
	},
	searchWrapper: {
		position: 'relative',
		marginBottom: 15,
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
	card: {
		backgroundColor: theme.colors.light.card,
		borderRadius: 12,
		padding: 16,
		marginBottom: 14,
		borderWidth: 1,
		borderColor: theme.colors.light.primary + '22',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 5,
		shadowOffset: { width: 0, height: 2 },
	},
	courseText: {
		textTransform: 'uppercase',
	},
	sectionText: {
		textTransform: 'uppercase',
		marginTop: 3,
	},
	teacherContainer: {
		marginTop: 18,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.light.primary + '22',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 30,
		width: 180,
	},
	teacherName: {
		textTransform: 'uppercase',
		width: '80%',
	},
	avatar: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 8,
		borderWidth: 1,
		borderColor: theme.colors.light.primary,
		backgroundColor: '#ccc',
	},
	emptyText: {
		textAlign: 'center',
		color: '#888',
		fontSize: 16,
	},
});

export default ClassesScreen;
