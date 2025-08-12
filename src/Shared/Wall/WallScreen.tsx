import React, { useEffect, useState, useRef } from 'react';
import {
	Animated,
	ActivityIndicator,
	FlatList,
	Modal,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Image,
	Dimensions,
	Vibration,
	Easing,
	Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { loadClassWallFromLocal, saveClassWallToLocal } from "../../utils/cache/Shared/localClassWall";
import { getWall, reactPost } from "../../api/modules/wallApi.ts";
import { CText } from "../../components/common/CText.tsx";
import RenderHtml from 'react-native-render-html';
import { formatDate } from "../../utils/dateFormatter";
import { globalStyles } from "../../theme/styles.ts";
import { theme } from "../../theme";
import BackHeader from "../../components/layout/BackHeader.tsx";
import {useLoading} from "../../context/LoadingContext.tsx";
import {useLoading2} from "../../context/Loading2Context.tsx";

const PAGE_SIZE = 10;

const WallScreen = ({ route, navigation }) => {
	const { ClassID } = route.params || {};

	const [wall, setWall] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(300)).current;
	const heartScales = useRef({}).current;
	const [lastFetched, setLastFetched] = useState(null);
	const { showLoading2, hideLoading2 } = useLoading2();

	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		if (!ClassID) return;

		const loadCache = async () => {
			showLoading2('Loading wall...');
			const { data, date } = await loadClassWallFromLocal(ClassID);
			if (data) {
				hideLoading2();
				setWall(data);
				setLastFetched(date);
				setPage(Math.ceil(data.length / PAGE_SIZE));
				setHasMore(true);
			}
		};

		loadCache();
	}, [ClassID]);

	const fetchWall = async (pageToLoad = 1, overwrite = false) => {
		if (loading) return;
		setLoading(true);

		try {
			const filter = {
				page: pageToLoad,
				ClassID,
			};

			const response = await getWall(filter);
			const newData = response.data || [];

			console.log('Fetched', newData.length, 'items');

			newData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

			if (overwrite) {
				setWall(newData);
				setPage(1);
			} else {
				setWall((prev) => {
					const existingIds = new Set(prev.map((item) => item.id));
					const filteredNewData = newData.filter((item) => !existingIds.has(item.id));
					return [...prev, ...filteredNewData];
				});
				setPage(pageToLoad);
			}

			setHasMore(newData.length === PAGE_SIZE);

			const combinedData = overwrite ? newData : [...wall, ...newData];
			const now = await saveClassWallToLocal(ClassID, combinedData);
			setLastFetched(now);
		} catch (error) {
			console.error('Fetch wall error:', error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const handleRefresh = () => {
		setRefreshing(true);
		fetchWall(1, true);
	};

	const openModal = () => {
		setShowModal(true);
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
	};

	const closeModal = () => {
		Animated.timing(slideAnim, {
			toValue: 300,
			duration: 250,
			useNativeDriver: true,
		}).start(() => setShowModal(false));
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
		} catch (e) {
			// silently fail
		}
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

	const handleComment = (postId) => {
		navigation.navigate('WallComments', { postId });
	};

	const handleWallOption = (option) => {
		closeModal();
		if (option === 'post') {
			navigation.navigate('PostWall', { ClassID });
		} else if (option === 'meet') {
			navigation.navigate('ClassMeeting', { ClassID });
		}
	};

	const renderItem = ({ item }) => (
		<View style={styles.postCard}>
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

			<View style={[styles.postActions, { justifyContent: 'space-between' }]}>
				<View style={[globalStyles.cardRow, { justifyContent: 'space-between', width: 80 }]}>
					<TouchableOpacity style={styles.actionBtn} onPress={() => handleReaction(item.id)}>
						<Animated.View style={{ transform: [{ scale: getHeartScale(item.id) }] }}>
							<Icon
								name={item.is_react_by_you ? 'heart' : 'heart-outline'}
								size={20}
								color={item.is_react_by_you ? theme.colors.light.primary : '#ccc'}
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
					<View style={{ alignItems: 'flex-start' }}>
						<TouchableOpacity
							style={styles.gmeetJoinButton}
							onPress={() => Linking.openURL(item.MeetLink)}
						>
							<Icon name="videocam" size={18} color="#188038" />
						</TouchableOpacity>
					</View>
				)}
			</View>
		</View>
	);

	const renderHeader = () => (
		<View style={{paddingHorizontal: 16}}>
			{lastFetched ? (
				<CText fontSize={12}>Last updated: {formatDate(lastFetched, 'MMM dd, yyyy')}</CText>
			) : null}
		</View>
	);

	const handleEndReached = () => {
		if (loading || refreshing || !hasMore) return;
		fetchWall(page + 1, false);
	};

	return (
		<>
			<BackHeader title="Wall" />
			<SafeAreaView style={[globalStyles.safeArea]}>
				{lastFetched && (
					<View style={{
						paddingHorizontal: 16,
						paddingBottom: 8,
						paddingTop: 4,
						backgroundColor: '#fff',
						borderBottomWidth: StyleSheet.hairlineWidth,
						borderBottomColor: '#ddd'
					}}>
						<CText fontSize={12} color="#777">
							Last updated: {formatDate(lastFetched, 'MMM dd, yyyy')}
						</CText>
					</View>
				)}

				<FlatList
					data={wall}
					keyExtractor={(item) => String(item.id)}
					renderItem={renderItem}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							colors={[theme.colors.light.primary]}
						/>
					}
					onEndReached={handleEndReached}
					onEndReachedThreshold={0.5}
					ListFooterComponent={
						loading ? (
							<ActivityIndicator size="large" color={theme.colors.light.primary} />
						) : null
					}
				/>

				<TouchableOpacity
					style={styles.floatingButton}
					onPress={openModal}
				>
					<Icon name="add" size={28} color="#fff" />
				</TouchableOpacity>

				<Modal transparent visible={showModal} animationType="none">
					<TouchableOpacity style={globalStyles.overlay} onPress={closeModal} />
					<Animated.View style={[globalStyles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
						<TouchableOpacity
							style={globalStyles.option}
							onPress={() => handleWallOption('post')}
						>
							<Icon name="document-text-outline" size={20} color="#333" />
							<CText fontStyle={'SB'} fontSize={15} style={{ marginLeft: 10 }}>Post</CText>
						</TouchableOpacity>
						<TouchableOpacity
							style={globalStyles.option}
							onPress={() => handleWallOption('meet')}
						>
							<Icon name="people-outline" size={20} color="#333" />
							<CText fontStyle={'SB'} fontSize={15} style={{ marginLeft: 10 }}>Meet</CText>
						</TouchableOpacity>
					</Animated.View>
				</Modal>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	postCard: {
		backgroundColor: '#fff',
		padding: 15,
		marginHorizontal: 10,
		marginVertical: 5,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	postHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#ccc',
	},
	postBody: {
		fontSize: 14,
		color: '#333',
		marginBottom: 10,
	},
	postActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	reactionCount: {
		marginLeft: 4,
		color: '#999',
	},
	gmeetJoinButton: {
		backgroundColor: '#e1f0db',
		padding: 6,
		borderRadius: 10,
	},
	floatingButton: {
		position: 'absolute',
		bottom: 30,
		right: 20,
		backgroundColor: theme.colors.light.primary,
		borderRadius: 30,
		width: 55,
		height: 55,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 5,
		elevation: 5,
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	modalContent: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		padding: 20,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
	},
	modalItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
	},
});

export default WallScreen;
