import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {
	View,
	Text,
	ScrollView,
	Image,
	StyleSheet,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Animated,
	Easing,
	useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { NetworkContext } from '../../../context/NetworkContext.tsx';
import BackgroundWrapper from '../../../utils/BackgroundWrapper';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import { CText } from '../../../components/CText.tsx';
import { handleApiError } from '../../../utils/errorHandler.ts';
import { getWall, reactPost } from '../../../api/modules/wallApi.ts';
import Icon from 'react-native-vector-icons/Ionicons';
import { FILE_BASE_URL } from '../../../api/api_configuration.ts';
import { useAuth } from '../../../context/AuthContext.tsx';
import { formatDate } from '../../../utils/dateFormatter';
import { useFocusEffect } from '@react-navigation/native';
import { useLoading } from '../../../context/LoadingContext.tsx';
import BackHeader from '../../../components/BackHeader.tsx';
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
	const heartScales = useRef({}).current;
	const { showLoading, hideLoading } = useLoading();
	const { width } = useWindowDimensions();

	const fetch = async (pageNumber = 1, filters = {}) => {
		if (loading) return;
		try {
			setLoading(true);
			showLoading('Loading...');

			const filter = {
				page: pageNumber,
				ClassID,
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

			setWall(pageNumber === 1 ? List : [...wall, ...List]);
			setPage(pageNumber);
			setHasMore(pageNumber < totalPages);
		} catch (error) {
			handleApiError(error, 'Failed to load wall posts');
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

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
		} catch (e) {
			console.error('Reaction error', e);
		}
	};

	const handleComment = (postId) => {
		navigation.navigate('WallComments', { postId });
	};

	return (
		<>
			<BackHeader title="Wall" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={[globalStyles.safeArea]}>
				<View style={{ flex: 1, paddingHorizontal: 10 }}>
					<ScrollView
						contentContainerStyle={{ paddingBottom: 100 }}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={handleRefresh}
							/>
						}
					>
						{wall.map((item, index) => (
							<View key={index} style={styles.postCard}>
								<View style={styles.postHeader}>
									<Image
										source={
											item.created_by?.profile_pic
												? {
													uri: `${FILE_BASE_URL}/${item.created_by?.profile_pic}`,
												}
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
											{item.created_by?.name}
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
									<TouchableOpacity
										style={styles.actionBtn}
										onPress={() => handleReaction(item.id)}
									>
										<Animated.View
											style={{
												transform: [
													{ scale: getHeartScale(item.id) },
												],
											}}
										>
											<Icon
												name={
													item.is_react_by_you
														? 'heart'
														: 'heart-outline'
												}
												size={20}
												color={
													item.is_react_by_you
														? theme.colors.light.primary
														: '#aaa'
												}
											/>
										</Animated.View>
										<CText
											fontSize={14}
											style={styles.reactionCount}
										>
											{item.reactions_count > 0
												? item.reactions_count
												: ''}
										</CText>
									</TouchableOpacity>

									<TouchableOpacity
										style={styles.actionBtn}
										onPress={() => handleComment(item.id)}
									>
										<Icon
											name="chatbubble-outline"
											size={20}
											color="#aaa"
										/>
										<CText
											fontSize={14}
											style={styles.reactionCount}
										>
											{item.comments?.length > 0
												? item.comments.length
												: ''}
										</CText>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</ScrollView>

					{/* FAB */}
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
		width: 35,
		height: 35,
		borderRadius: 60,
		backgroundColor: '#ccc',
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
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 25,
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: theme.colors.light.primary,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		zIndex: 10,
	},
});

export default WallScreen;
