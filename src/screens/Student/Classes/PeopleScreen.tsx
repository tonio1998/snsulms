import React, { useCallback, useContext, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { globalStyles } from '../../../theme/styles.ts';
import { CText } from '../../../components/common/CText.tsx';
import { theme } from '../../../theme';
import { NetworkContext } from '../../../context/NetworkContext.tsx';
import { getMyClassmates } from '../../../api/modules/classmatesApi.ts';
import { useLoading } from '../../../context/LoadingContext.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import BackHeader from '../../../components/layout/BackHeader.tsx';
import {useLoading2} from "../../../context/Loading2Context.tsx";

const PeopleScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const [classmates, setClassmates] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading2, hideLoading2 } = useLoading2();
	const [searchQuery, setSearchQuery] = useState('');
	const debounceTimeout = useRef(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const fetchClassmates = async (pageNumber = 1, filters = {}) => {
		try {
			if (pageNumber === 1) setClassmates([]);
			setLoading(true);
			showLoading2('Loading...');

			const filter = {
				page: pageNumber,
				...(filters.search !== undefined
					? { search: filters.search }
					: searchQuery
						? { search: searchQuery }
						: {}),
				ClassID,
			};

			const response = await getMyClassmates(filter);
			let List = response?.data ?? [];
			console.log("student list", List);

			List.sort((a, b) => {
				const nameA = a.details?.FirstName?.toLowerCase() || '';
				const nameB = b.details?.FirstName?.toLowerCase() || '';
				return nameA.localeCompare(nameB);
			});

			if (pageNumber === 1) {
				setClassmates(List);
			} else {
				setClassmates((prev) => [...prev, ...List]);
			}

			setHasMore(List.length > 0);
			setPage(pageNumber);
		} catch (error) {
			handleApiError(error, 'Error fetching classmates');
		} finally {
			setLoading(false);
			hideLoading2();
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchClassmates();
			return () => {
				if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
			};
		}, [])
	);

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
				<CText style={styles.email}>{item.student_info?.user?.email}</CText>
			</View>
		</View>
	);

	return (
		<>
			<BackHeader title="People" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
				<View style={{ flex: 1, paddingHorizontal: 16 }}>
					<View style={styles.searchWrapper}>
						<TextInput
							placeholder="Search ..."
							placeholderTextColor="#000"
							value={searchQuery}
							onChangeText={handleSearchTextChange}
							style={styles.searchInput}
						/>
						{searchQuery !== '' && (
							<TouchableOpacity style={styles.clearBtn} onPress={() => {
								setSearchQuery('');
								if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
								fetchClassmates(1, { search: '' });
							}}>
								<Icon name={'close'} size={25} color={'#000'} />
							</TouchableOpacity>
						)}
					</View>

					<FlatList
						data={classmates}
						keyExtractor={(item, index) => index.toString()}
						renderItem={renderItem}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
						ListEmptyComponent={!loading && <CText style={styles.emptyText}>No data found 😶</CText>}
						contentContainerStyle={{
							paddingBottom: 0,
							flexGrow: classmates.length === 0 ? 1 : 0,
						}}
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.5}
					/>
				</View>
			</SafeAreaView>
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
	searchWrapper: {
		marginBottom: 10,
		position: 'relative',
		zIndex: 99,
	},
	searchInput: {
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#fff',
		padding: 15,
		paddingRight: 35,
		borderRadius: 8,
		fontWeight: '500',
		height: 50,
	},
	clearBtn: {
		position: 'absolute',
		right: 10,
		top: 10,
	},
});

export default PeopleScreen;