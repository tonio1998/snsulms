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
import { getStudents } from '../../api/studentsApi.ts';
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

const StudentScreen = ({ navigation }) => {
	const network = useContext(NetworkContext);
	const [students, setStudents] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [yearLevel, setYearLevel] = useState('');

	const fetchStudents = async (pageNumber = 1, filters = {}) => {
		try {
			if (loading) return;
			setLoading(true);

			const filter = {
				page: pageNumber,
				...(filters.search !== undefined ? { search: filters.search } : searchQuery ? { search: searchQuery } : {}),
				...(filters.YearLevel !== undefined ? { YearLevel: filters.YearLevel } : yearLevel ? { YearLevel: yearLevel } : {}),
			};
			let studentsList = [];
			let totalPages = 1;

			if (network?.isOnline) {
				const res = await getStudents(filter);
				console.log(res)
				studentsList = res.data?.data ?? [];
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
		fetchStudents(1);
	}, []);

	useFocusEffect(
		useCallback(() => {
			fetchStudents(1);
		}, [])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchStudents(1);
		setRefreshing(false);
	};

	const handleSearch = (text) => {
		setSearchQuery(text);
		fetchStudents(1, { search: text });
	};

	const handleYearFilter = (level) => {
		setYearLevel(level);
		fetchStudents(1, { YearLevel: level });
	};

	const handleLoadMore = () => {
		if (hasMore && !loading) {
			fetchStudents(page + 1);
		}
	};

	const debounceTimeout = useRef(null);

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

		debounceTimeout.current = setTimeout(() => {
			fetchStudents(1, { search: text });
		}, 500);
	};

	const renderFooter = () => {
		return loading ? <ActivityIndicator size="large" color={theme.colors.light.primary} /> : null;
	};

	const handleViewStudent = (student) => {
		navigation.navigate('StudentDetails', { student });
	};

	const handleAddStudent = () => {
		navigation.navigate('AddStudent');
	};

	return (
		<>
			<CustomHeader />
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea]}>
					<View style={{ flex: 1, paddingHorizontal: 16 }}>
						<View style={{ position: 'relative', marginBottom: 10}}>
							<TextInput
								placeholder="Search by name"
								placeholderTextColor="#000"
								value={searchQuery}
								onChangeText={handleSearchTextChange}
								onSubmitEditing={() => fetchStudents(1)}
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
										fetchStudents(1);
									}}
								>
									<Text style={{ fontSize: 16, color: '#888' }}>✕</Text>
								</TouchableOpacity>
							)}
						</View>

						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
							<View style={{ flexDirection: 'row', marginBottom: 10 }}>
								{['', 6,7,8,9,10,11,12].map((level, idx) => (
									<TouchableOpacity
										key={idx}
										onPress={() => handleYearFilter(level)}
										style={{
											backgroundColor: yearLevel === level ? theme.colors.light.primary : '#ccc',
											paddingVertical: 5,
											paddingHorizontal: 20,
											borderRadius: 7,
											marginRight: 8,
											alignItems: 'center',
											justifyContent: 'center',
											minHeight: 35,
											maxHeight: 35
										}}
									>
										<CText style={{ color: '#fff' }} numberOfLines={1} fontSize={16}>
											{level === '' ? 'All' : `Grade ${level}`}
										</CText>
									</TouchableOpacity>

								))}
							</View>
						</ScrollView>


						<FlatList
							data={students}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
								<TouchableOpacity activeOpacity={0.5}
												  onPress={() => handleViewStudent(item.id)}
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										padding: 12,
										backgroundColor: '#f5f5f5',
										borderRadius: 8,
										marginBottom: 10,
									}}
								>
									<Image
										source={
											item.filepath
												? { uri: FILE_BASE_URL + item.filepath }
												: require('../../../assets/img/ic_launcher.png')
										}
										style={{
											width: 60,
											height: 60,
											borderRadius: 30,
											marginRight: 12,
											backgroundColor: '#ccc',
										}}
									/>
									<View>
										<CText fontStyle={'SB'} fontSize={14} style={{ textTransform: 'uppercase' }}>
											{item.FirstName} {item.MiddleName ? item.MiddleName.charAt(0) + '.' : ''} {item.LastName}
										</CText>

										<Text>LRN: {item.LRN} | Grade: {item.YearLevel}</Text>
										<Text>Section: {item.Section} | {item.id}</Text>
										{item?.guardian && (
											<Text>Guardian: {item?.guardian?.FirstName} {item?.guardian?.LastName}</Text>
										)}
										{item?.student_user?.nfc_code  && (
											<Text>NFC: ✅</Text>
										)}
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
						<View style={styles.floatBtn}>
							<TouchableOpacity
								activeOpacity={0.8}
								style={styles.fab}
								onPress={handleAddStudent}>
								<Icon name={'add'} size={25} color={'#fff'} />
							</TouchableOpacity>
						</View>
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
		backgroundColor: theme.colors.light.secondary,
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

export default StudentScreen;
