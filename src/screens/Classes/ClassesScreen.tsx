import React, { useCallback, useContext, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
} from 'react-native';
import { handleApiError } from '../../utils/errorHandler.ts';
import CustomHeader from '../../components/CustomHeader.tsx';
import { globalStyles } from '../../theme/styles.ts';
import BackgroundWrapper from '../../utils/BackgroundWrapper';
import { FILE_BASE_URL } from '../../api/api_configuration.ts';
import { CText } from '../../components/CText.tsx';
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { getMyClasses } from '../../api/modules/classesApi.ts';
import { ShimmerList } from '../../components/ShimmerList.tsx';
import { useLoading } from '../../context/LoadingContext.tsx';
import { getAcademicInfo } from '../../utils/getAcademicInfo.ts';
import { getOfflineClasses, saveClassesOffline } from '../../utils/sqlite/offlineClassesService.ts';

const ClassesScreen = ({ navigation }) => {
	const network = useContext(NetworkContext);
	const { showLoading, hideLoading } = useLoading();

	const [classes, setClasses] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [acad, setAcad] = useState(null);
	const [acadRaw, setAcadRaw] = useState(null);

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
					await fetchClasses(1, {}, acadStr, acadInfo); // fetch with up-to-date data
				}
			})();
			return () => {
				isActive = false;
			};
		}, [])
	);

	const fetchClasses = async (pageNumber = 1, filters = {}, currentAcad = acad, currentAcadRaw = acadRaw) => {
		if (!currentAcad || !currentAcadRaw || loading) return;
		try {
			setLoading(true);
			showLoading('Loading classes...');

			const filter = {
				page: pageNumber,
				...(filters.search !== undefined
					? { search: filters.search }
					: searchQuery
						? { search: searchQuery }
						: {}),
				AcademicYear: currentAcad,
			};

			let classesList = [];
			let totalPages = 1;

			if (network?.isOnline) {
				const res = await getMyClasses(filter);
				classesList = res.data ?? [];
				totalPages = res.data?.last_page ?? 1;

				await saveClassesOffline(classesList, {
					from: currentAcadRaw.from,
					to: currentAcadRaw.to,
					semester: currentAcadRaw.semester,
				});
			} else {
				const offlineFilter = {
					...filters,
					Semester: currentAcadRaw.semester,
					AYFrom: currentAcadRaw.from,
					AYTo: currentAcadRaw.to,
				};
				const offlineList = await getOfflineClasses(offlineFilter);
				classesList = offlineList ?? [];
				totalPages = 1;
			}

			setClasses(pageNumber === 1 ? classesList : [...classes, ...classesList]);
			setPage(pageNumber);
			setHasMore(pageNumber < totalPages);
		} catch (error) {
			handleApiError(error, 'Failed to load classes');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchClasses(1);
		setRefreshing(false);
	};

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			fetchClasses(1, { search: text });
		}, 500);
	};

	const handleClearSearch = () => {
		setSearchQuery('');
		fetchClasses(1, { search: '' });
	};

	const handleLoadMore = () => {
		if (hasMore && !loading) {
			fetchClasses(page + 1);
		}
	};

	const renderFooter = () =>
		loading ? (
			<ActivityIndicator size="large" color={theme.colors.light.primary} style={{ marginVertical: 15 }} />
		) : null;

	const renderClassItem = ({ item }) => {
		const teacher = item.class_info?.teacher || {};
		const avatarUri = teacher.avatar
			? teacher.avatar
			: `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name ?? 'User')}&background=random`;

		return (
			<TouchableOpacity
				activeOpacity={0.6}
				onPress={() =>
					navigation.navigate('ClassDetails', {
						ClassStudentID: item.ClassStudentID,
						ClassID: item.class_info?.ClassID,
						Title: item.class_info?.CourseName,
					})
				}
				style={styles.card}
			>
				<View>
					<CText fontStyle="SB" fontSize={14} style={{ textTransform: 'uppercase' }} numberOfLines={2}>
						{item.class_info?.CourseCode} - {item.class_info?.CourseName}
					</CText>
					<CText fontStyle="SB" fontSize={15} style={{ textTransform: 'uppercase', marginTop: 3 }} numberOfLines={2}>
						{item.class_info?.Section}
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
			<BackgroundWrapper>
				<SafeAreaView style={globalStyles.safeArea}>
					<View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 10 }}>
						<View style={styles.searchWrapper}>
							<TextInput
								placeholder="Search classes..."
								placeholderTextColor="#666"
								value={searchQuery}
								onChangeText={handleSearchTextChange}
								onSubmitEditing={() => fetchClasses(1)}
								returnKeyType="search"
								style={styles.searchInput}
								clearButtonMode="while-editing"
							/>
							{searchQuery ? (
								<TouchableOpacity style={styles.clearBtn} onPress={handleClearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
									<Icon name="close-circle" size={22} color="#666" />
								</TouchableOpacity>
							) : null}
						</View>

						<ShimmerList
							data={classes}
							loading={loading}
							keyExtractor={(item) => item.ClassStudentID.toString()}
							renderItem={renderClassItem}
							refreshing={refreshing}
							onRefresh={handleRefresh}
							onEndReached={handleLoadMore}
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
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
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
		marginBottom: 14,
		padding: 16,
		borderWidth: 1,
		borderColor: theme.colors.light.primary + '22',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 5,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3,
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
	avatar: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 8,
		borderWidth: 1,
		borderColor: theme.colors.light.primary,
		backgroundColor: '#ccc',
	},
});

export default ClassesScreen;
