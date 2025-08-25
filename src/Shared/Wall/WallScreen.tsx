import React, { useEffect, useState, useRef } from 'react';
import {
	Animated,
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
import { useLoading } from "../../context/LoadingContext.tsx";
import { useClass } from "../../context/SharedClassContext.tsx";
import ActivityIndicator2 from "../../components/loaders/ActivityIndicator2.tsx";
import HomeHeader from "../../components/layout/HomeHeader.tsx";
import SNSULogoDraw from "../../components/loaders/SNSULogoDraw.tsx";
import {LastUpdatedBadge} from "../../components/common/LastUpdatedBadge";
import OptionModal from "../../components/OptionModal.tsx";

const PAGE_SIZE = 10;

const WallScreen = ({ navigation }) => {
	const { classes } = useClass();
	const ClassID = classes?.ClassID;
	const [wall, setWall] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const slideAnim = useRef(new Animated.Value(300)).current;
	const heartScales = useRef({}).current;
	const [lastFetched, setLastFetched] = useState(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const { showLoading, hideLoading } = useLoading();

	const loadCache = async () => {
		if (!ClassID) return;
		setLoading(true);
		const { data, date } = await loadClassWallFromLocal(ClassID);
		if (data) {
			setWall(data);
			setLastFetched(date);
			setPage(Math.ceil(data.length / PAGE_SIZE));
			setLoading(false);
		} else {
			fetchWall(1, true);
		}
	};

	useEffect(() => {
		loadCache();
	}, [ClassID]);

	const fetchWall = async (pageToLoad = 1, overwrite = false) => {
		if (loading) return;
		setLoading(true);
		try {
			const filter = { page: pageToLoad, ClassID };
			const response = await getWall(filter);
			const newData = response.data || [];
			newData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

			setWall(prev => {
				const combined = overwrite ? newData : [...prev, ...newData];
				const uniqueMap = new Map();
				combined.forEach(item => uniqueMap.set(item.id, item));
				return Array.from(uniqueMap.values());
			});

			setPage(pageToLoad);
			setHasMore(newData.length === PAGE_SIZE);

			const combinedData = overwrite ? newData : [...wall, ...newData];
			const now = await saveClassWallToLocal(ClassID, combinedData);
			setLastFetched(now);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = () => {
		setLoading(true);
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
		const scale = getHeartScale(postId);
		Animated.sequence([
			Animated.timing(scale, { toValue: 1.5, duration: 100, useNativeDriver: true }),
			Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
		]).start();

		// Vibration.vibrate(100);

		setWall(prev =>
			prev.map(item =>
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
	};

	const getHeartScale = (postId) => {
		if (!heartScales[postId]) heartScales[postId] = new Animated.Value(1);
		return heartScales[postId];
	};

	const handleComment = (postId) => navigation.navigate('WallComments', { postId });

	const handleWallOption = (option) => {
		closeModal();
		if (option === 'post') navigation.navigate('PostWall', { ClassID });
		else if (option === 'meet') navigation.navigate('ClassMeeting', { ClassID });
	};

	const handleEndReached = () => {
		if (!hasMore || loading || refreshing) return;
		fetchWall(page + 1, false);
	};

	const PostCard = ({ item, handleReaction }) => (
		<View style={styles.postCard}>
			{/* HEADER */}
			<View style={styles.postHeader}>
				<Image
					source={
						item.created_by?.avatar
							? { uri: `${item.created_by.avatar}` }
							: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.created_by?.name || 'User')}&background=random` }
					}
					style={styles.avatar}
				/>
				<View style={{ marginLeft: 10, flex: 1 }}>
					<CText fontSize={15} fontStyle="SB" numberOfLines={1}>
						{item.created_by?.name}
					</CText>
					<CText fontSize={12} color="#777">
						{formatDate(item.created_at, 'MMM dd, yyyy • hh:mm a')}
					</CText>
				</View>
			</View>

			{/* BODY */}
			{item.body && (
				<RenderHtml
					contentWidth={Dimensions.get('window').width - 40}
					source={{ html: item.body }}
					baseStyle={styles.postBody}
				/>
			)}
			<View style={styles.postFooter}>
				{item.MeetLink && (
					<TouchableOpacity
						style={styles.gmeetJoinButton}
						onPress={() => Linking.openURL(item.MeetLink)}
					>
						<Icon name="videocam" size={18} color={theme.colors.light.primary} />
						<CText fontSize={12} style={{ marginLeft: 6, color: theme.colors.light.primary }}>
							Join
						</CText>
					</TouchableOpacity>
				)}
				<View style={styles.actionsLeft}>
					<TouchableOpacity style={styles.actionBtn} onPress={() => handleReaction(item.id)}>
						<Animated.View style={{ transform: [{ scale: getHeartScale(item.id) }] }}>
							<Icon
								name={item.is_react_by_you ? 'heart' : 'heart-outline'}
								size={20}
								color={item.is_react_by_you ? theme.colors.light.primary : '#aaa'}
							/>
						</Animated.View>
						{item.reactions_count > 0 && (
							<CText fontSize={13} style={styles.reactionCount}>
								{item.reactions_count}
							</CText>
						)}
					</TouchableOpacity>

					<TouchableOpacity style={styles.actionBtn} onPress={() => handleComment(item.id)}>
						<Icon name="chatbubble-outline" size={20} color="#aaa" />
						{item.comments?.length > 0 && (
							<CText fontSize={13} style={styles.reactionCount}>
								{item.comments.length}
							</CText>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);


	const handleSelect = (value: string) => {
		console.log("Selected:", value);
		setShowModal(false);
	};

	return (
		<>
			<HomeHeader title="Wall" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 100 }]}>
				<FlatList
					data={wall}
					keyExtractor={(item) => String(item?.id) + '_' + item?.created_at}
					renderItem={({ item }) => <PostCard item={item} handleReaction={handleReaction} />}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.light.primary]} />
					}
					onEndReached={handleEndReached}
					onEndReachedThreshold={0.5}
					ListHeaderComponent={() => (
						<View>
							<View style={{ paddingHorizontal: 10}}>
								<LastUpdatedBadge
									date={lastFetched}
									onReload={handleRefresh}
								/>
							</View>
							{loading && <ActivityIndicator2 />}
						</View>
					)}

				/>

				<TouchableOpacity style={globalStyles.fab} onPress={() => setShowModal(true)}>
					<Icon name="add" size={28} color="#fff" />
				</TouchableOpacity>

				<OptionModal
					visible={showModal}
					onClose={closeModal}
					options={[
						{ label: "Post", value: "post", icon: "document-text-outline" },
						{ label: "Meet", value: "meet", icon: "people-outline" },
					]}
					onSelect={(value) => {
						handleWallOption(value);
						closeModal();
					}}
				/>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	postCard: {
		backgroundColor: '#fff',
		padding: 15,
		marginHorizontal: 10,
		marginVertical: 8,
		borderRadius: theme.radius.md,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	postHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	avatar: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: '#ccc',
	},
	postBody: {
		fontSize: 14,
		color: '#333',
		lineHeight: 20,
		marginBottom: 12,
	},
	postFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: '#eee',
		paddingTop: 10,
	},
	actionsLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 16,
	},
	reactionCount: {
		marginLeft: 4,
		color: '#666',
	},
	gmeetJoinButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.light.primary + '15',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
	},
	floatingButton: {
		position: 'absolute',
		bottom: 30,
		right: 20,
		backgroundColor: theme.colors.light.warning,
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
});

export default WallScreen;
