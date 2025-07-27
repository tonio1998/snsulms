import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	Linking,
	ActivityIndicator,
	RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { handleApiError } from '../../../utils/errorHandler';
import { globalStyles } from '../../../theme/styles';
import { CText } from '../../../components/CText';
import { theme } from '../../../theme';
import { NetworkContext } from '../../../context/NetworkContext';
import { getMyClassmates } from '../../../api/modules/classmatesApi.ts';
import { useLoading } from '../../../context/LoadingContext.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import BackHeader from '../../../components/BackHeader.tsx';
import BackgroundWrapper from '../../../utils/BackgroundWrapper';
import { getOfflineClassmates, saveClassmatesOffline } from '../../../utils/sqlite/offlineClassmatesService.ts';

const PeopleScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const [classmates, setClassmates] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const network = useContext(NetworkContext);
	const [searchQuery, setSearchQuery] = useState('');
	const debounceTimeout = useRef(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const fetchClassmates = async (pageNumber = 1, filters = {}) => {
		try {
			if (pageNumber === 1) setClassmates([]);
			setLoading(true);
			showLoading('Loading...');

			const filter = {
				page: pageNumber,
				...(filters.search !== undefined
					? { search: filters.search }
					: searchQuery
						? { search: searchQuery }
						: {}),
				ClassID,
			};

			let List = [];

			if (network?.isOnline) {
				const response = await getMyClassmates(filter);
				List = response?.data ?? [];

				// Sort by LastName (assuming structure: item.student_info?.LastName)
				List.sort((a, b) => {
					const nameA = a.student_info?.FirstName?.toLowerCase() || '';
					const nameB = b.student_info?.FirstName?.toLowerCase() || '';
					return nameA.localeCompare(nameB);
				});

				await saveClassmatesOffline(List, ClassID);

				if (pageNumber === 1) {
					setClassmates(List);
				} else {
					setClassmates((prev) => [...prev, ...List]);
				}

				setHasMore(List.length > 0);
				setPage(pageNumber);
			} else {
				List = await getOfflineClassmates(ClassID, filter.search || '');
				setClassmates(List);
				setHasMore(false);
				setPage(1);
			}

		} catch (error) {
			handleApiError(error, 'Error fetching classmates');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchClassmates();

			return () => {
				if (debounceTimeout.current) clearTimeout(debounceTimeout.current); // Cleanup debounce on unmount
			};
		}, [])
	);

	const handleEmailPress = (email) => {
		Linking.openURL(`mailto:${email}`);
	};

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

		debounceTimeout.current = setTimeout(() => {
			fetchClassmates(1, { search: text });
		}, 500);
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchClassmates(1);
		setRefreshing(false);
	};

	const handleLoadMore = () => {
		if (hasMore && !loading) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchClassmates(nextPage);
		}
	};

	// const renderFooter = () => {
	// 	return loading ? (
	// 		<ActivityIndicator size="large" color={theme.colors.light.primary} />
	// 	) : null;
	// };

	const renderItem = ({ item }) => (
		<View style={styles.card}>
			<Image
				source={
					item.student_info?.user?.profile_pic
						? { uri: item.student_info.user.profile_pic }
						: item.student_info?.user?.avatar
							? { uri: item.student_info.user.avatar }
							: {
								uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
									item.student_info?.user?.name || 'User'
								)}&background=random`,
							}
				}
				style={styles.avatar}
			/>

			<View style={{ flex: 1 }}>
				<CText style={styles.name} fontStyle={'SB'} fontSize={14.5}>
					{item.student_info?.FirstName} {item.student_info?.LastName}
				</CText>
				<TouchableOpacity onPress={() => handleEmailPress(item.student_info?.user?.email)}>
					<CText style={styles.email}>{item.student_info?.user?.email}</CText>
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<>
			<BackHeader title={'People'} />
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
					<View style={{ flex: 1, paddingHorizontal: 16 }}>
						{/* Search Bar */}
						<View style={{ marginBottom: 10, position: 'relative', zIndex: 99 }}>
							<TextInput
								placeholder="Search ..."
								placeholderTextColor="#000"
								value={searchQuery}
								onChangeText={handleSearchTextChange}
								style={{
									borderWidth: 1,
									borderColor: '#ccc',
									backgroundColor: '#fff',
									padding: 15,
									paddingRight: 35,
									borderRadius: 8,
									fontWeight: '500',
									height: 50,
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
										setSearchQuery('');
										if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
										fetchClassmates(1, { search: '' });
									}}
								>
									<Icon name={'close'} size={25} color={'#000'} />
								</TouchableOpacity>
							)}
						</View>

						<FlatList
							data={classmates}
							keyExtractor={(item, index) => index.toString()}
							renderItem={renderItem}
							refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
							ListEmptyComponent={!loading && <CText style={styles.emptyText}>No classmates found 😶</CText>}
							// ListFooterComponent={renderFooter}
							contentContainerStyle={{
								paddingBottom: 0,
								flexGrow: classmates.length === 0 ? 1 : 0,
							}}
							onEndReached={handleLoadMore}
							onEndReachedThreshold={0.5}
						/>
					</View>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		marginBottom: 12,
		padding: 12,
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
		backgroundColor: '#ccc',
	},
	name: {
		color: '#222',
	},
	email: {
		fontSize: 14,
		marginTop: 4,
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 40,
		color: '#999',
	},
});

export default PeopleScreen;
