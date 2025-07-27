import React, {useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
	View,
	TextInput,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView, Image, ScrollView, StyleSheet, Animated, Easing
} from 'react-native';
import {NetworkContext} from "../../../context/NetworkContext.tsx";
import CustomHeader from "../../../components/CustomHeader.tsx";
import BackgroundWrapper from "../../../utils/BackgroundWrapper";
import {globalStyles} from "../../../theme/styles.ts";
import {theme} from "../../../theme";
import {CText} from "../../../components/CText.tsx";
import {handleApiError} from "../../../utils/errorHandler.ts";
import {getWall, reactPost} from "../../../api/modules/wallApi.ts";
import Icon from "react-native-vector-icons/Ionicons";
import {FILE_BASE_URL} from "../../../api/api_configuration.ts";
import {useAuth} from "../../../context/AuthContext.tsx";
import CButton from "../../../components/CButton.tsx";
import {formatDate} from "../../../utils/dateFormatter";
import {useFocusEffect} from "@react-navigation/native";
import {useLoading} from "../../../context/LoadingContext.tsx";
import BackHeader from "../../../components/BackHeader.tsx";
import {getOfflineWall, saveWallOffline} from "../../../utils/sqlite/offlineWallService.ts";

const WallScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const [wall, setWall] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const heartScales = useRef({}).current;
	const { showLoading, hideLoading } = useLoading();

	useLayoutEffect(() => {
		navigation.setOptions({
			title: route.params?.customTitle || 'Default Title',
		});
	}, [navigation, route.params?.customTitle]);

	const fetch = async (pageNumber = 1, filters = {}) => {
		try {
			if (loading) return;
			setLoading(true);
			showLoading("Loading...")

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
				totalPages = res.data?.last_page ?? 1;

				await saveWallOffline(List, ClassID);
			} else {
				const offlineList = await getOfflineWall({ ClassID, ...filters });
				List = offlineList ?? [];
				totalPages = 1;
			}


			setWall(prev =>
				pageNumber === 1 ? List : [...prev, ...List]
			);
			setPage(pageNumber);
			setHasMore(pageNumber < totalPages);

		} catch (error) {
			handleApiError(error, "Failed to load students");
		} finally {
			setLoading(false);
			hideLoading()
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


	const getHeartScale = (postId) => {
		if (!heartScales[postId]) {
			heartScales[postId] = new Animated.Value(1);
		}
		return heartScales[postId];
	};

	const bounceHeart = (postId) => {
		const scale = getHeartScale(postId);
		Animated.sequence([
			Animated.timing(scale, {
				toValue: 1.8,
				duration: 100,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
			Animated.timing(scale, {
				toValue: 1,
				duration: 100,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
		]).start();
	}

	const handleReaction = async (postId) => {
		try {
			bounceHeart(postId);
			setWall(prevWall =>
				prevWall.map(item => {
					if (item.id === postId) {
						const isReacted = item.is_react_by_you;
						return {
							...item,
							is_react_by_you: !isReacted,
							reactions_count: isReacted
								? Math.max((item.reactions_count || 1) - 1, 0)
								: (item.reactions_count || 0) + 1,
						};
					}
					return item;
				})
			);

			await reactPost(postId);
		} catch (e) {
			setWall(prevWall =>
				prevWall.map(item => {
					if (item.id === postId) {
						const isReacted = item.is_react_by_you;
						return {
							...item,
							is_react_by_you: !isReacted,
							reactions_count: isReacted
								? Math.max((item.reactions_count || 1) - 1, 0)
								: (item.reactions_count || 0) + 1,
						};
					}
					return item;
				})
			);
		}
	};

	const handleComment = async (postId) => {
		navigation.navigate('WallComments', {
			postId
		});
	}


	return (
		<>
			<BackHeader title={'Wall'} />
			<BackgroundWrapper>
				<SafeAreaView style={[globalStyles.safeArea]}>
					<View style={{ flex: 1, paddingHorizontal: 10 }}>
						<View style={[styles.card, globalStyles.shadowBtn, { padding: 16 }]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Image
									source={
										user?.profile_pic
											? { uri: `${FILE_BASE_URL}/${user?.profile_pic}` }
											: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random` }
									}
									style={styles.avatarLarge}
								/>
								<View style={{ flex: 1, marginLeft: 10 }}>
									<CText fontSize={15} fontStyle="SB">{user?.name}</CText>
									<CText fontSize={12} color="#888">{user?.email}</CText>
								</View>
								<TouchableOpacity
									style={styles.createPostBtn}
									onPress={() => navigation.navigate('PostWall', { ClassID })}
								>
									<Icon name="add" size={22} color="#fff" />
								</TouchableOpacity>
							</View>
						</View>

						<ScrollView contentContainerStyle={{ paddingBottom: 100, borderTopLeftRadius: 20, borderTopRightRadius: 20 }} refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
						}>
							{wall.map((item, index) => (
								<View key={index} style={styles.postCard}>
									<View style={styles.postHeader}>
										<Image
											source={
												item.created_by?.profile_pic
													? { uri: `${FILE_BASE_URL}/${item.created_by?.profile_pic}` }
													: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.created_by?.name || 'User')}&background=random` }
											}
											style={styles.avatar}
										/>
										<View style={{ marginLeft: 10, flex: 1 }}>
											<CText fontSize={14.5} fontStyle="SB">{item.created_by?.name}</CText>
											<CText fontSize={11} color="#777">{formatDate(item.created_at, 'relative')}</CText>
										</View>
									</View>

									<CText style={styles.postBody}>{item.body}</CText>

									<View style={styles.postActions}>
										<TouchableOpacity style={styles.actionBtn} onPress={() => handleReaction(item.id)}>
											<Animated.View style={{ transform: [{ scale: getHeartScale(item.id) }] }}>
												<Icon name={item.is_react_by_you ? 'heart' : 'heart-outline'} size={20} color={item.is_react_by_you ? theme.colors.light.primary : '#aaa'} />
											</Animated.View>
											<CText fontSize={14} style={styles.reactionCount}>
												{item.reactions_count > 0 ? item.reactions_count : ''}
											</CText>
										</TouchableOpacity>

										<TouchableOpacity style={styles.actionBtn} onPress={() => handleComment(item.id)}>
											<Icon name="chatbubble-outline" size={20} color="#aaa" />
											<CText fontSize={14} style={styles.reactionCount}>
												{item.comments?.length > 0 ? item.comments.length : ''}
											</CText>
										</TouchableOpacity>
									</View>
								</View>

							))}
						</ScrollView>
					</View>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	avatarLarge: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#ccc',
	},

	createPostBtn: {
		backgroundColor: theme.colors.light.primary,
		borderRadius: 20,
		padding: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},

	postCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		marginHorizontal: 5,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},

	postHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},

	postBody: {
		marginTop: 5,
		marginBottom: 10,
		fontSize: 14.5,
		color: '#333',
	},

	postActions: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		borderTopWidth: 1,
		borderTopColor: '#eee',
		paddingTop: 10,
	},

	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 20,
	},

	reactionCount: {
		marginLeft: 6,
		color: '#333',
	},

	card: {
		backgroundColor: theme.colors.light.card,
		// padding: 16,
		borderRadius: 8,
		marginBottom: 10,
		marginHorizontal: 5,
		elevation: 1
	},
	avatar: {
		width: 35,
		height: 35,
		borderRadius: 60,
		// borderWidth: 2,
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
