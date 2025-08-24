import React, { useContext, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	FlatList,
	RefreshControl,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
	StatusBar,
	Vibration
} from 'react-native';
import { globalStyles } from '../../theme/styles.ts';
import { handleApiError } from '../../utils/errorHandler.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { NetworkContext } from '../../context/NetworkContext.tsx';
import { CText } from '../../components/common/CText.tsx';
import { theme } from '../../theme';
import CButton from '../../components/buttons/CButton.tsx';
import { getWallComments, postWallComment } from '../../api/modules/wallApi.ts';
import { formatDate } from '../../utils/dateFormatter';
import { FILE_BASE_URL } from '../../../env.ts';
import notificationEmitter from "../../utils/notificationEmitter.ts";

const WallCommentsScreen = ({ route, navigation }) => {
	const postId = route.params.postId;
	const { user } = useAuth();
	const network = useContext(NetworkContext);

	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [body, setBody] = useState('');

	useEffect(() => {
		navigation.setOptions({ title: 'Comments' });
	}, [navigation]);

	const fetchComments = async () => {
		if (loading) return;
		try {
			setLoading(true);
			const res = await getWallComments({
				page: 1,
				commentable_type: 'App\\Models\\LMS\\ClassFeed',
				commentable_id: postId,
			});
			setComments(res.data || []);
		} catch (err) {
			handleApiError(err, 'Failed to load comments');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadComments();
		const handler = (data: any) => {
			Vibration.vibrate([500, 1000, 500, 1000]);
			loadComments();
		};
		notificationEmitter.on('newMessage', handler);
		return () => {
			notificationEmitter.off('newMessage', handler);
		};
	}, []);

	const loadComments = async () => {
		await fetchComments();
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchComments();
		setRefreshing(false);
	};

	const postComment = async () => {
		if (!body.trim()) return;

		const tempId = `temp-${Date.now()}`;
		const optimisticComment = {
			id: tempId,
			content: body,
			created_by: {
				name: user?.name || 'You',
				profile_pic: user?.profile_pic || null,
				avatar: user?.avatar || null,
			},
			created_at: new Date().toISOString(),
			sending: true,
		};

		setComments(prev => [optimisticComment, ...prev]);
		setBody('');

		try {
			await postWallComment({
				content: body,
				commentable_type: 'App\\Models\\LMS\\ClassFeed',
				commentable_id: postId
			});
			await fetchComments();
		} catch (err) {
			handleApiError(err, 'Failed to post comment');
			setComments(prev => prev.filter(c => c.id !== tempId));
		}
	};

	const renderComment = ({ item }) => {
		const isYou = item.created_by?.name === user?.name;

		return (
			<View
				style={[
					styles.commentRow,
					isYou ? styles.commentRowRight : styles.commentRowLeft,
				]}
			>
				{!isYou && (
					<Image
						source={
							item.created_by?.profile_pic
								? { uri: `${FILE_BASE_URL}/${item.created_by.profile_pic}` }
								: item.created_by?.avatar
									? { uri: item.created_by.avatar }
									: {
										uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
											item.created_by?.name || "User"
										)}&background=random`,
									}
						}
						style={styles.avatar}
					/>
				)}

				<View
					style={[
						styles.commentBubble,
						isYou ? styles.commentBubbleYou : styles.commentBubbleOther,
						item.sending && { opacity: 0.5 },
					]}
				>
					<View style={styles.headerRow}>
						<CText fontStyle="SB" fontSize={13}>
							{isYou ? "You" : item.created_by?.name}
						</CText>
						<CText fontSize={11} style={styles.timeText}>
							{item.sending ? "Sending..." : formatDate(item.created_at, "relative")}
						</CText>
					</View>
					<CText fontSize={14} style={styles.commentText}>
						{item.content}
					</CText>
				</View>
			</View>
		);
	};


	return (
		<>
			<SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={{ flex: 1 }}
					keyboardVerticalOffset={90}
				>
					<FlatList
						data={comments}
						keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
						renderItem={renderComment}
						contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
						ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
						ListEmptyComponent={!loading && (
							<View style={styles.emptyContainer}>
								<CText style={styles.emptyText}>No comments yet. Be the first!</CText>
							</View>
						)}
					/>

					<View style={styles.inputContainer}>
						<TextInput
							value={body}
							onChangeText={setBody}
							style={styles.input}
							placeholder="Write a comment..."
							placeholderTextColor="#777"
							multiline
							numberOfLines={2}
						/>
						<CButton
							icon="send"
							onPress={postComment}
							disabled={!body.trim()}
							type="success"
							style={styles.sendBtn}
							textStyle={styles.sendText}
						/>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</>
	);
};

export default WallCommentsScreen;

const styles = StyleSheet.create({
	commentRow: {
		flexDirection: "row",
		marginVertical: 6,
		maxWidth: "85%",
	},
	commentRowLeft: {
		alignSelf: "flex-start",
	},
	commentRowRight: {
		alignSelf: "flex-end",
		flexDirection: "row-reverse",
	},
	commentBubble: {
		padding: 10,
		borderRadius: 12,
		shadowOpacity: 0.03,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	commentBubbleOther: {
		backgroundColor: "#fff",
		marginLeft: 6,
	},
	commentBubbleYou: {
		backgroundColor: theme.colors.light.primary + "22",
		marginRight: 6,
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 2,
	},
	timeText: {
		color: "#888",
		fontSize: 11,
	},
	commentText: {
		color: "#222",
		fontSize: 14,
	},
	inputContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderColor: "#eee",
	},
	input: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: Platform.OS === "ios" ? 10 : 6,
		fontSize: 15,
		maxHeight: 100,
	},
	sendBtn: {
		marginLeft: 8,
		backgroundColor: theme.colors.light.primary,
		borderRadius: 50,
		padding: 12,
	},
	sendText: {
		color: "#fff",
		fontSize: 15,
	},
});
