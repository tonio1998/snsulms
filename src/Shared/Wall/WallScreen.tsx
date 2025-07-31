import React, { useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	Image,
	StyleSheet,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Animated,
	Easing,
	Dimensions,
	FlatList,
	Modal,
	ActivityIndicator,
	Vibration, Linking,
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
import { getOfflineWall, saveWallOffline } from '../../utils/sqlite/offlineWallService.ts';
import { getWallVersion } from '../../api/modules/Versioning/versionna.ts';
import { CACHE_REFRESH } from '../../../env.ts';
import notificationEmitter from '../../utils/notificationEmitter.ts';
import { sortByDateDesc } from '../../utils/cache/dataHelpers';
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import api from "../../api/api.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {createGoogleMeet} from "../../utils/gmeet/gmeet.ts";

const { height } = Dimensions.get('window');

let lastWallVersionCheck = 0;
let lastWallVersionResult = null;

const WallScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	console.log("WallScreen: ", route.params)
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [wall, setWall] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const heartScales = useRef({}).current;
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(height)).current;

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
			console.warn('Wall version check failed:', err.message);
			return null;
		}
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
				setWall((prev) => [...prev, ...newList]);
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
		const handler = () => fetch(1);
		notificationEmitter.on('newMessage', handler);
		return () => notificationEmitter.off('newMessage', handler);
	}, []);

	const openModal = () => {
		setShowModal(true);
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true,
		}).start();
	};

	const closeModal = () => {
		Animated.timing(slideAnim, {
			toValue: height,
			duration: 250,
			useNativeDriver: true,
		}).start(() => setShowModal(false));
	};

	const handleWallOption = async (type) => {
		closeModal();
		if (type === 'post') {
			navigation.navigate('PostWall', { ClassID });
		} else if (type === 'meet') {
			navigation.navigate('ClassMeeting', { ClassID }); // 👈 new screen for input
		}
	};


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
			Vibration.vibrate(100);
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
					contentWidth={Dimensions.get('window').width - 40}
					source={{ html: item.body }}
					baseStyle={styles.postBody}
				/>
			) : null}

			<View style={[styles.postActions, {justifyContent: 'space-between'}]}>
				<View style={[globalStyles.cardRow, {justifyContent: 'space-between', width: 80}]}>
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
				{item.MeetLink && (
					<View style={{ marginTop: 10, alignItems: 'flex-start' }}>
						<TouchableOpacity
							style={styles.gmeetJoinButton}
							onPress={() => Linking.openURL(item.MeetLink)}
						>
							<Icon name="videocam" size={18} color="#188038" style={{ marginRight: 8 }} />
							<CText fontSize={14} style={styles.gmeetJoinText}>
								Join with Google Meet
							</CText>
						</TouchableOpacity>
					</View>
				)}

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

					<TouchableOpacity style={styles.fab} activeOpacity={0.7} onPress={openModal}>
						<Icon name="add" size={28} color="#fff" />
					</TouchableOpacity>

					{showModal && (
						<Modal transparent visible={showModal} animationType="none">
							<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal} />
							<Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
								<TouchableOpacity style={styles.option} onPress={() => handleWallOption('post')}>
									<CText fontStyle="SB" fontSize={16}>📢 Post to Wall</CText>
								</TouchableOpacity>
								<TouchableOpacity style={styles.option} onPress={() => handleWallOption('meet')}>
									<CText fontStyle="SB" fontSize={16}>📅 Create Meeting</CText>
								</TouchableOpacity>
								<TouchableOpacity style={styles.cancel} onPress={closeModal}>
									<CText fontStyle="SB" fontSize={15} style={{ color: '#ff5555' }}>Cancel</CText>
								</TouchableOpacity>
							</Animated.View>
						</Modal>
					)}

				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	gmeetJoinButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 16,
		backgroundColor: '#fff',
		borderColor: '#dcdcdc',
		borderWidth: 1,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 1.41,
		elevation: 2,
	},

	gmeetJoinText: {
		color: '#188038',
		fontWeight: '600',
	},

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
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	modalContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: 30,
		paddingTop: 12,
		paddingHorizontal: 24,
	},
	option: {
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderColor: '#eee',
	},
	cancel: {
		marginTop: 20,
		alignItems: 'center',
	},
});

export default WallScreen;
