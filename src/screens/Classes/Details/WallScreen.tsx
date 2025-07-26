import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
				setWall(List)
				totalPages = res.data?.last_page ?? 1;
			} else {
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
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 0}]}>
				<View style={{ flex: 1, padding: 10 }}>
					<View style={[styles.card, globalStyles.shadowBtn, { padding: 16}]}>
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
					<ScrollView contentContainerStyle={{ paddingBottom: 100 }} refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}>
						{wall.map((item, index) => (
							<View key={index} style={styles.card}>
								<View style={{ padding: 16 }}>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
										<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
											<Image
												source={
													item.created_by?.profile_pic
														? { uri: `${FILE_BASE_URL}/${item.created_by?.profile_pic}` }
														: item.created_by?.avatar
															? { uri: item.created_by?.avatar }
															: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
																	item.created_by?.name || 'User'
																)}&background=random`
															}
												}
												style={styles.avatar}
											/>
											<View>
												<CText fontSize={16} fontStyle={'SB'} style={{ color: '#000', marginLeft: 10 }}>{ item.created_by?.name }</CText>
												<CText fontSize={12} style={{ color: '#000', marginLeft: 10, marginTop: -5 }}>{ formatDate(item?.created_at, 'relative') }</CText>
											</View>
										</View>
									</View>
									<View style={{ marginTop: 10 }}>
										<CText fontSize={15} style={{ color: '#000', marginLeft: 10 }}>{ item.body }</CText>
									</View>
								</View>
								<View style={{ borderTopWidth: 1, borderColor: '#E2F8EC', marginTop: 10, padding: 16 }}>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
										<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
											<Animated.View style={{ transform: [{ scale: getHeartScale(item.id) }] }}>
												<TouchableOpacity onPress={() => handleReaction(item.id)}>
													<Icon
														name={item.is_react_by_you ? 'heart' : 'heart-outline'}
														size={20}
														color={item.is_react_by_you ? theme.colors.light.primary : '#ccc'}
													/>
												</TouchableOpacity>
											</Animated.View>
											<CText fontSize={12} style={{ color: '#000', marginLeft: 5 }}>{ item.reactions_count || 0 }</CText>
										</View>
										<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
											<Animated.View style={{ transform: [{ scale: getHeartScale(item.id) }] }}>
												<TouchableOpacity onPress={() => handleComment(item.id)}>
													<Icon
														name={'chatbubble-outline'}
														size={20}
														color={'#ccc'}
													/>
												</TouchableOpacity>
											</Animated.View>
											<CText fontSize={12} style={{ color: '#000', marginLeft: 5 }}>{ item.comments_count || 0 }</CText>
										</View>
									</View>
								</View>
							</View>
						))}
					</ScrollView>
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.light.card,
		// padding: 16,
		borderRadius: 8,
		marginBottom: 10,
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
