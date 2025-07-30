import React, {
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from 'react';
import {
	View,
	Image,
	StyleSheet,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Animated,
	Easing,
	useWindowDimensions,
	FlatList,
	ActivityIndicator,
	ToastAndroid,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import { globalStyles } from '../../theme/styles.ts';
import { theme } from '../../theme';
import { CText } from '../../components/common/CText.tsx';
import { handleApiError } from '../../utils/errorHandler.ts';
import { getWall, reactPost } from '../../api/modules/wallApi.ts';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatDate } from '../../utils/dateFormatter';
import { useLoading } from '../../context/LoadingContext.tsx';
import BackHeader from '../../components/layout/BackHeader.tsx';
import {
	getOfflineWall,
	saveWallOffline,
} from '../../utils/sqlite/offlineWallService.ts';
import { getWallVersion } from '../../api/modules/Versioning/versionna.ts';
import { CACHE_REFRESH } from '../../../env.ts';
import notificationEmitter from '../../utils/notificationEmitter.ts';
import {sortByDateDesc} from "../../utils/cache/dataHelpers";

let lastWallVersionCheck = 0;
let lastWallVersionResult = null;

const getCachedWallVersion = async (filter) => {
	const now = Date.now();
	if (lastWallVersionCheck && now - lastWallVersionCheck < CACHE_REFRESH) {
		return lastWallVersionResult;
	}
	try {
		const version = await getWallVersion(filter);
		lastWallVersionCheck = now;
		lastWallVersionResult = version;
		return version;
	} catch (err) {
		console.warn('⚠️ Wall version check failed:', err.message);
		return null;
	}
};

const WallScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [wall, setWall] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const heartScales = useRef({}).current;
	const { width } = useWindowDimensions();

	const sortPosts = (list) => {
		return [...list].sort((a, b) => {
			const aIsMine = a.created_by?.id === user.id;
			const bIsMine = b.created_by?.id === user.id;
			if (aIsMine && !bIsMine) return -1;
			if (!aIsMine && bIsMine) return 1;
			return 0;
		});
	};

	const fetch = async (pageNumber = 1, isRefresh = false) => {
		if (loading) return;

		try {
			if (isRefresh) setRefreshing(true);
			setLoading(true);

			const filter = { page: pageNumber, ClassID };
			const localList = await getOfflineWall({ ClassID });
			const localUpdatedAt = localList?.[0]?.updatedAt;

			if (pageNumber === 1) {
				const sortedLocal = sortByDateDesc(localList ?? []);
				setWall(sortedLocal);
			}

			if (!network?.isOnline) return;

			if (pageNumber === 1) {
				const version = await getCachedWallVersion({ ClassID });
				const isOutdated = version?.last_updated !== localUpdatedAt;

				if (isOutdated) {
					const res = await getWall({ ...filter });
					const onlineList = sortByDateDesc(res.data ?? []);

					await saveWallOffline(onlineList, ClassID, {
						updatedAt: version?.last_updated || new Date().toISOString(),
					});

					setWall(onlineList);
					setHasMore((res?.last_page ?? 1) > 1);
					setPage(1);
				}
			}

			if (pageNumber > 1) {
				const res = await getWall({ ...filter });
				const newList = res.data ?? [];
				setWall(prev => [...prev, ...newList]);
				setHasMore((res?.last_page ?? 1) > pageNumber);
				setPage(pageNumber);
			}

		} catch (error) {
			handleApiError(error, 'Failed to load wall posts');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetch(1);
		const handler = () => {
			fetch(1);
		};
		notificationEmitter.on('newMessage', handler);
		return () => {
			notificationEmitter.off('newMessage', handler);
		};
	}, []);

	const handleRefresh = () => fetch(1, true);

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
	};

	const handleReaction = async (postId) => {
		try {
			bounceHeart(postId);
			setWall((prev) =>
				prev.map((item) =>
					item.id === postId
						? {
							...item,
							is_react_by_you: !item.is_react_by_you,
							reactions_count: item.is_react_by_you
								? Math.max((item.reactions_count || 1) - 1, 0)
								: (item.reactions_count || 0) + 1,
						}
						: item
				)
			);
			await reactPost(postId);
		} catch (e) {}
	};

	const handleComment = (postId) => {
		navigation.navigate('WallComments', { postId });
	};

	const renderItem = ({ item }) => (
		<View style={styles.postCard} key={item.id}>
			<View style={styles.postHeader}>
				<Image
					source={
						item.created_by?.avatar
							? { uri: `${item.created_by.avatar}` }
							: {
								uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
									item.created_by?.name || 'User'
								)}&background=random`,
							}
					}
					style={styles.avatar}
				/>
				<View style={{ marginLeft: 10, flex: 1 }}>
					<CText fontSize={14.5} fontStyle="SB">
						{item.created_by?.name.toUpperCase()}
					</CText>
					<CText fontSize={11} color="#777">
						{formatDate(item.created_at, 'relative')}
					</CText>
				</View>
			</View>

			{item.body ? (
				<RenderHtml
					contentWidth={width - 40}
					source={{ html: item.body }}
					baseStyle={styles.postBody}
					tagsStyles={{
						p: { marginBottom: 6, color: '#333' },
						strong: { fontWeight: 'bold' },
						em: { fontStyle: 'italic' },
					}}
				/>
			) : null}

			<View style={styles.postActions}>
				<TouchableOpacity style={styles.actionBtn} onPress={() => handleReaction(item.id)}>
					<Animated.View style={{ transform: [{ scale: getHeartScale(item.id) }] }}>
						<Icon
							name={item.is_react_by_you ? 'heart' : 'heart-outline'}
							size={20}
							color={item.is_react_by_you ? theme.colors.light.primary : '#aaa'}
						/>
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
	);

	return (
		<>
			<BackHeader title="Wall" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={globalStyles.safeArea}>
				<View style={{ flex: 1, paddingHorizontal: 10 }}>
					<FlatList
						data={wall}
						keyExtractor={(item, index) => item.id?.toString() || index.toString()}
						renderItem={renderItem}
						contentContainerStyle={{ paddingBottom: 100 }}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						onEndReached={() => {
							if (hasMore && !loading) fetch(page + 1);
						}}
						onEndReachedThreshold={0.3}
						ListFooterComponent={
							loading && hasMore ? (
								<View style={{ paddingVertical: 20 }}>
									<ActivityIndicator size="small" color="#999" />
								</View>
							) : null
						}
					/>

					<TouchableOpacity
						style={styles.fab}
						activeOpacity={0.7}
						onPress={() => navigation.navigate('PostWall', { ClassID })}
					>
						<Icon name="add" size={28} color="#fff" />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 32,
		backgroundColor: '#ccc',
	},
	postCard: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 14,
		marginBottom: 10,
		marginHorizontal: 5,
		elevation: 1,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 1.5,
	},
	postHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	postBody: {
		marginTop: 6,
		marginBottom: 12,
		fontSize: 14,
		color: '#2d2d2d',
		lineHeight: 20,
	},
	postActions: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		gap: 16,
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
		paddingTop: 8,
		marginTop: 6,
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 4,
	},
	reactionCount: {
		marginLeft: 6,
		color: '#555',
		fontSize: 13,
	},
	fab: {
		position: 'absolute',
		right: 18,
		bottom: 20,
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: theme.colors.light.primary,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		zIndex: 999,
	},
});

export default WallScreen;
