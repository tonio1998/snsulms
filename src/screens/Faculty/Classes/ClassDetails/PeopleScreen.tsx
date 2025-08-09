import React, { useCallback, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	RefreshControl,
	Linking, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import { CText } from '../../../../components/common/CText.tsx';
import BackHeader from '../../../../components/layout/BackHeader.tsx';
import { useLoading } from '../../../../context/LoadingContext.tsx';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { useClass } from '../../../../context/SharedClassContext.tsx';

const PeopleScreen = () => {
	const { classes } = useClass();
	const ClassID = classes?.ClassID;
	const [classmates, setClassmates] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const debounceTimeout = useRef(null);
	const fetchClassmates = async (filters = {}) => {
		try {
			showLoading('Loading...');
			let list = [...(classes?.students || [])];
			if (filters.search) {
				const query = filters.search.toLowerCase();
				list = list.filter((x) =>
					`${x.details?.FirstName} ${x.details?.LastName}`.toLowerCase().includes(query)
				);
			}

			list.sort((a, b) =>
				(a.student_info?.FirstName || '').localeCompare(b.student_info?.FirstName || '')
			);

			console.log(list);

			setClassmates(list);
		} catch (err) {
			handleApiError(err, 'Error fetching classmates');
		} finally {
			hideLoading();
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchClassmates();
			return () => debounceTimeout.current && clearTimeout(debounceTimeout.current);
		}, [])
	);

	const handleSearch = (text) => {
		setSearchQuery(text);
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => fetchClassmates({ search: text }), 500);
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchClassmates();
		setRefreshing(false);
	};

	const renderItem = ({ item }) => (
		<>
			<View style={styles.card}>
				<Image
					source={{
						uri:
							item.details?.user?.profile_pic ||
							item.details?.user?.avatar ||
							`https://ui-avatars.com/api/?name=${encodeURIComponent(item.details?.user?.name || 'User')}&background=random`,
					}}
					style={styles.avatar}
				/>
				<View style={{ flex: 1 }}>
					<CText style={styles.name} fontStyle="SB" fontSize={14.5}>
						{item.details?.FirstName} {item.details?.LastName}
					</CText>
					<CText style={styles.email}>{item.details?.user?.email}</CText>
				</View>
			</View>
		</>
	);

	return (
		<>
			<BackHeader title="People" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
				<View style={{ flex: 1, paddingHorizontal: 16 }}>
					<View style={{ marginBottom: 10, position: 'relative' }}>
						<TextInput
							placeholder="Search ..."
							value={searchQuery}
							onChangeText={handleSearch}
							style={styles.searchBox}
							placeholderTextColor="#000"
						/>
						{searchQuery !== '' && (
							<TouchableOpacity
								style={styles.clearBtn}
								onPress={() => {
									setSearchQuery('');
									if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
									fetchClassmates();
								}}
							>
								<Icon name="close" size={22} color="#000" />
							</TouchableOpacity>
						)}
					</View>

					<FlatList
						data={classmates}
						keyExtractor={(_, i) => i.toString()}
						renderItem={renderItem}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
						ListEmptyComponent={<CText style={styles.emptyText}>No data found 😶</CText>}
						contentContainerStyle={{ flexGrow: classmates.length === 0 ? 1 : 0 }}
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
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		// elevation: 1,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
		backgroundColor: '#ccc',
	},
	name: { color: '#222' },
	email: { fontSize: 14, marginTop: 4 },
	emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
	searchBox: {
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#fff',
		padding: 15,
		paddingRight: 35,
		borderRadius: 8,
		fontWeight: '500',
		height: 50,
	},
	clearBtn: { position: 'absolute', right: 10, top: 12 },
});

export default PeopleScreen;
