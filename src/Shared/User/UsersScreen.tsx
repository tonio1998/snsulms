import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Image,
	ScrollView,
	StyleSheet
} from 'react-native';
import { handleApiError } from '../../utils/errorHandler.ts';
import CustomHeader from '../../components/layout/CustomHeader.tsx';
import { globalStyles } from '../../theme/styles.ts';
import BackgroundWrapper from '../../utils/BackgroundWrapper';
import { FILE_BASE_URL } from '../../../env.ts';
import { CText } from '../../components/common/CText.tsx';
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers } from '../../api/modules/userApi.ts';
import { getOfflineUsers, saveUsersOffline } from '../../utils/sqlite/offlineUsers';
import { getRoles } from '../../api/modules/rolesPermissionApi.ts';

const UsersScreen = ({ navigation }) => {
	const network = useContext(NetworkContext);
	const [users, setUsers] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [yearLevel, setYearLevel] = useState('');
	const [roles, setRoles] = useState([]);
	const [roleFilter, setRoleFilter] = useState('');


	const fetchUsers = async (pageNumber = 1, filters = {}) => {
		try {
			if (loading) return;
			setLoading(true);

			const filter = {
				page: pageNumber,
				...(filters.search !== undefined ? { search: filters.search } : searchQuery ? { search: searchQuery } : {}),
				...(filters.role !== undefined ? { role: filters.role } : roleFilter ? { role: roleFilter } : {}),
			};

			console.log('filter: ', filter)

			let usersList = [];
			let totalPages = 1;

			if (network?.isOnline) {
				const res = await getUsers(filter);
				usersList = res.data?.data ?? [];
				totalPages = res.data?.last_page ?? 1;

				await saveUsersOffline(usersList);
			} else {
				console.log('Fetching from local DB:', filter);
				usersList = await getOfflineUsers(filter);
			}

			setUsers(prev =>
				pageNumber === 1 ? usersList : [...prev, ...usersList]
			);
			setPage(pageNumber);
			setHasMore(pageNumber < totalPages);

		} catch (error) {
			console.error('Failed to fetch users:', error);
			handleApiError(error, 'Failed to load users');
		} finally {
			setLoading(false);
		}
	};

	const fetchRoles = async () => {
		try {
			const res = await getRoles();
			setRoles(['', ...res]);
		} catch (error) {
			handleApiError(error, 'sd')
			console.error('Failed to fetch roles:', error);
		}
	};

	useEffect(() => {

		fetchRoles();
		fetchUsers(1);
	}, []);

	useFocusEffect(
		useCallback(() => {
			fetchUsers(1);
		}, [])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		fetchRoles();
		await fetchUsers(1);
		setRefreshing(false);
	};

	const handleSearch = (text) => {
		setSearchQuery(text);
		fetchUsers(1, { search: text });
	};

	const handleYearFilter = (level) => {
		setYearLevel(level);
		fetchUsers(1, { YearLevel: level });
	};

	const handleLoadMore = () => {
		if (hasMore && !loading) {
			fetchUsers(page + 1);
		}
	};

	const debounceTimeout = useRef(null);

	const handleSearchTextChange = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

		debounceTimeout.current = setTimeout(() => {
			fetchUsers(1, { search: text });
		}, 500);
	};

	const renderFooter = () => {
		return loading ? <ActivityIndicator size="large" color={theme.colors.light.primary} /> : null;
	};

	const handleViewUser = (user) => {
		navigation.navigate('UserDetails', { user });
	};

	return (
		<>
			<CustomHeader />
			<BackgroundWrapper>
				<SafeAreaView style={globalStyles.safeArea}>
					<View style={{ flex: 1, paddingHorizontal: 16 }}>
						<View style={{ position: 'relative', marginBottom: 10 }}>
							<TextInput
								placeholder="Search by name"
								placeholderTextColor="#000"
								value={searchQuery}
								onChangeText={handleSearchTextChange}
								onSubmitEditing={() => fetchUsers(1)}
								style={{
									borderWidth: 1,
									borderColor: '#ccc',
									backgroundColor: '#fff',
									padding: 15,
									paddingRight: 35,
									borderRadius: 8,
									fontWeight: '500'
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
										fetchUsers(1);
									}}
								>
									<Text style={{ fontSize: 16, color: '#888' }}>✕</Text>
								</TouchableOpacity>
							)}
						</View>

						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
							<View style={{ flexDirection: 'row' }}>
								{roles.map((role, idx) => (
									<TouchableOpacity
										key={idx}
										onPress={() => {
											handleYearFilter('');
											setRoleFilter(role);
											fetchUsers(1, { role });
										}}
										style={{
											backgroundColor: roleFilter === role ? theme.colors.light.primary : '#ccc',
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
											{role === '' ? 'All' : role}
										</CText>
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>


						<FlatList
							data={users}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
								<TouchableOpacity
									activeOpacity={0.5}
									onPress={() => handleViewUser(item.id)}
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
											item?.profile_pic
											? { uri: `${FILE_BASE_URL}/${item.profile_pic}` }
											: item?.avatar
											? { uri: item.avatar }
											: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item?.name || 'User')}&background=random` } // Auto-gen avatar
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
										<CText fontStyle="SB" fontSize={14} style={{ textTransform: 'uppercase' }}>
											{item.name}
										</CText>
										<Text>{item.email}</Text>
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
									<Text style={{ textAlign: 'center', marginTop: 20 }}>No users found.</Text>
								)
							}
						/>
						{/*<View style={styles.floatBtn}>*/}
						{/*	<TouchableOpacity*/}
						{/*		activeOpacity={0.8}*/}
						{/*		style={styles.fab}*/}
						{/*		onPress={handleAddUser}*/}
						{/*	>*/}
						{/*		<Icon name="add" size={25} color="#fff" />*/}
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
	},
});

export default UsersScreen;
