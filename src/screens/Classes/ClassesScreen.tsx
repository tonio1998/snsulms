import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView, Image, ScrollView, StyleSheet
} from 'react-native';
import { handleApiError } from '../../utils/errorHandler.ts';
import CustomHeader from '../../components/CustomHeader.tsx';
import { globalStyles } from '../../theme/styles.ts';
import BackgroundWrapper from '../../utils/BackgroundWrapper';
import { FILE_BASE_URL } from '../../api/api_configuration.ts';
import { CText } from '../../components/CText.tsx';
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { getOfflineStudents, saveStudentsOffline } from '../../utils/sqlite/students';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { getMyClasses } from '../../api/modules/classesApi.ts';

const ClassesScreen = ({ navigation }) => {
	const network = useContext(NetworkContext);
	const [students, setStudents] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [yearLevel, setYearLevel] = useState('');

	const fetch = async (pageNumber = 1, filters = {}) => {
		try {
			if (loading) return;
			setLoading(true);

			const filter = {
				page: pageNumber,
				...(filters.search !== undefined ? { search: filters.search } : searchQuery ? { search: searchQuery } : {}),
			};
			let studentsList = [];
			let totalPages = 1;

			if (network?.isOnline) {
				const res = await getMyClasses(filter);
				console.log(res.data)
				studentsList = res.data ?? [];
				totalPages = res.data?.last_page ?? 1;

				await saveStudentsOffline(studentsList);
			} else {
				console.log("fetch using local:", filter)
				studentsList = await getOfflineStudents(filter);
			}

			setStudents(prev =>
				pageNumber === 1 ? studentsList : [...prev, ...studentsList]
			);
			setPage(pageNumber);
			setHasMore(pageNumber < totalPages);

		} catch (error) {
			console.error("Failed to fetch students:", error);
			handleApiError(error, "Failed to load students");
		} finally {
			setLoading(false);
		}
	};


	useEffect(() => {
		fetch(1);
	}, []);

	useFocusEffect(
		useCallback(() => {
			fetch(1);
		}, [])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetch(1);
		setRefreshing(false);
	};

	const handleSearch = (text) => {
		setSearchQuery(text);
		fetch(1, { search: text });
	};

	const handleYearFilter = (level) => {
		setYearLevel(level);
		fetch(1, { YearLevel: level });
	};

	const handleLoadMore = () => {
		if (hasMore && !loading) {
			fetch(page + 1);
		}
	};

	const debounceTimeout = useRef(null);

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

		debounceTimeout.current = setTimeout(() => {
			fetch(1, { search: text });
		}, 500);
	};

	const renderFooter = () => {
		return loading ? <ActivityIndicator size="large" color={theme.colors.light.primary} /> : null;
	};

	const handleViewClass = (ClassStudentID, ClassID, Title) => {
		navigation.navigate('ClassDetails', { ClassStudentID, ClassID, Title });
	};

	return (
		<>
			<CustomHeader />
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea]}>
					<View style={{ flex: 1, paddingHorizontal: 16 }}>
						<View style={{ position: 'relative', marginBottom: 10}}>
							<TextInput
								placeholder="Search ..."
								placeholderTextColor="#000"
								value={searchQuery}
								onChangeText={handleSearchTextChange}
								onSubmitEditing={() => fetch(1)}
								style={{
									borderWidth: 1,
									borderColor: '#ccc',
									backgroundColor:'#fff',
									padding: 15,
									paddingRight: 35,
									borderRadius: 8,
									// fontSize: 18,
									fontWeight: 500
								}}
							/>
							{searchQuery !== '' && (
								<TouchableOpacity
									style={{
										position: 'absolute',
										right: 10,
										top: 10,
									}}
									onPress={() => {
										handleSearch('');
										fetch(1);
									}}
								>
									<Text style={{ fontSize: 16, color: '#888' }}>✕</Text>
								</TouchableOpacity>
							)}
						</View>

						<FlatList
							data={students}
							keyExtractor={(item) => item.ClassStudentID.toString()}
							renderItem={({ item }) => (
								<TouchableOpacity activeOpacity={0.5}
												  onPress={() => handleViewClass(item.ClassStudentID, item.class_info?.ClassID, item.class_info?.CourseName)}
									style={{
										padding: 12,
										backgroundColor: theme.colors.light.muted_soft + '55',
										borderRadius: 8,
										marginBottom: 10,
									}}
								>
									<View>
										<CText fontStyle={'SB'} fontSize={14} style={{ textTransform: 'uppercase' }} numberOfLines={2}>
											{item.class_info?.CourseCode} - {item.class_info?.CourseName}
										</CText>
									</View>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
										<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
											<Image
												source={
													item.class_info?.teacher?.avatar
														? { uri: `${FILE_BASE_URL}/${item.class_info?.teacher?.avatar}` }
														: require('../../../assets/img/ic_launcher.png')
												}
												style={{
													width: 20,
													height: 20,
													borderRadius: 30,
													marginRight: 6,
													backgroundColor: '#ccc',
												}}
											/>
											<CText fontStyle={'SB'} fontSize={12} style={{ textTransform: 'uppercase' }}>
												{item.class_info?.teacher?.name}
											</CText>
										</View>
									</View>
								</TouchableOpacity>
							)}
							refreshControl={
								<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
							}
							onEndReached={handleLoadMore}
							onEndReachedThreshold={0.3}
							ListFooterComponent={renderFooter}
							ListEmptyComponent={
								!loading && (
									<Text style={{ textAlign: 'center', marginTop: 20 }}>No students found.</Text>
								)
							}
						/>
						{/*<View style={styles.floatBtn}>*/}
						{/*	<TouchableOpacity*/}
						{/*		activeOpacity={0.8}*/}
						{/*		style={styles.fab}*/}
						{/*		onPress={handleAddStudent}>*/}
						{/*		<Icon name={'add'} size={25} color={'#fff'} />*/}
						{/*	</TouchableOpacity>*/}
						{/*</View>*/}
					</View>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	floatBtn: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
	fab: {
		backgroundColor: theme.colors.light.primary,
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	}
});

export default ClassesScreen;
