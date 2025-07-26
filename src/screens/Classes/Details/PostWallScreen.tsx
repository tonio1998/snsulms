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
import {NetworkContext} from "../../../context/NetworkContext.tsx";
import CustomHeader from "../../../components/CustomHeader.tsx";
import BackgroundWrapper from "../../../utils/BackgroundWrapper";
import {globalStyles} from "../../../theme/styles.ts";
import {theme} from "../../../theme";
import {CText} from "../../../components/CText.tsx";
import {handleApiError} from "../../../utils/errorHandler.ts";
import {getOfflineStudents, saveStudentsOffline} from "../../../utils/sqlite/students";
import {getWall} from "../../../api/modules/wallApi.ts";
import Icon from "react-native-vector-icons/Ionicons";
import {FILE_BASE_URL} from "../../../api/api_configuration.ts";
import {useAuth} from "../../../context/AuthContext.tsx";
import CButton from "../../../components/CButton.tsx";

const WallScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const [students, setStudents] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');


	const fetch = async (pageNumber = 1, filters = {}) => {
		try {
			if (loading) return;
			setLoading(true);

			const filter = {
				page: pageNumber,
				...(filters.search !== undefined ? { search: filters.search } : searchQuery ? { search: searchQuery } : {}),
				ClassID: ClassID,
			};
			let List = [];
			let totalPages = 1;

			if (network?.isOnline) {
				const res = await getWall(filter);
				List = res.data ?? [];
				console.log(List)
				totalPages = res.data?.last_page ?? 1;

				await saveStudentsOffline(List);
			} else {
				List = await getOfflineStudents(filter);
			}

			setStudents(prev =>
				pageNumber === 1 ? List : [...prev, ...List]
			);
			setPage(pageNumber);
			setHasMore(pageNumber < totalPages);

		} catch (error) {
			handleApiError(error, "Failed to load students");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetch(1);
	}, []);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetch(1);
		setRefreshing(false);
	};

	return (
		<>
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 0}]}>
				<View style={{ flex: 1, padding: 10 }}>
					<ScrollView contentContainerStyle={{ paddingBottom: 100 }} refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}>
						<View style={styles.card}>
							<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
									<Image
										source={
											user?.profile_pic
												? { uri: `${FILE_BASE_URL}/${user?.profile_pic}` }
												: user?.avatar
													? { uri: user?.avatar }
													: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
															user?.name || 'User'
														)}&background=random`
													}
										}
										style={styles.avatar}
									/>
									<View>
										<CText fontSize={16} fontStyle={'SB'} style={{ color: '#000', marginLeft: 10 }}>{ user?.name }</CText>
										<CText fontSize={12} style={{ color: '#000', marginLeft: 10, marginTop: -5 }}>{ user?.email }</CText>
									</View>
								</View>
								<CButton
									icon={'add'}
									type="success"
									onPress={() => navigation.navigate('PostWall')}
									style={[ globalStyles.shadowBtn, { marginTop: 10, borderRadius: 20 }]}
								/>
							</View>
						</View>
					</ScrollView>
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.light.card,
		padding: 16,
		borderRadius: 8,
		marginBottom: 10,
	},
	avatar: {
		width: 35,
		height: 35,
		borderRadius: 60,
		borderWidth: 2,
		borderColor: theme.colors.light.primary,
	},
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

export default WallScreen;
