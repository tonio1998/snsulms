import {
	Alert,
	Image, Keyboard,
	KeyboardAvoidingView, Platform, RefreshControl,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity, TouchableWithoutFeedback,
	View
} from "react-native";
import {globalStyles} from "../../../theme/styles.ts";
import {handleApiError} from "../../../utils/errorHandler.ts";
import {useCallback, useContext, useEffect, useState} from "react";
import {useAuth} from "../../../context/AuthContext.tsx";
import {NetworkContext} from "../../../context/NetworkContext.tsx";
import {CText} from "../../../components/CText.tsx";
import {theme} from "../../../theme";
import CButton from "../../../components/CButton.tsx";
import {getWallComments, postWall, postWallComment} from "../../../api/modules/wallApi.ts";
import {getMyClasses} from "../../../api/modules/classesApi.ts";
import {useFocusEffect} from "@react-navigation/native";
import {formatDate} from "../../../utils/dateFormatter";
import {FILE_BASE_URL} from "../../../api/api_configuration.ts";

const WallCommentsScreen = ({ navigation, route }) => {
	const postId = route.params.postId;
	const network = useContext(NetworkContext);
	const { user } = useAuth();

	const [body, setBody] = useState('');
	const [remark, setRemark] = useState('post');
	const [loading, setLoading] = useState(false);
	const [comments, setComments] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [refreshing, setRefreshing] = useState(false);

	navigation.setOptions({
		headerTitle: 'Comments',
		headerTitleStyle: {
			fontSize: 18,
			color: '#fff',
			fontWeight: 'bold',
		},
	});

	const fetch = async (pageNumber = 1, filters = {}) => {
		try {
			if (loading) return;
			setLoading(true);

			const filter = {
				page: pageNumber,
				commentable_type: 'App\\Models\\LMS\\ClassFeed',
				commentable_id: postId,
			};
			let List = [];
			let totalPages = 1;

			if (network?.isOnline) {
				console.log('filter:', filter)
				const res = await getWallComments(filter);
				List = res.data ?? [];
				totalPages = res.data?.last_page ?? 1;

			} else {
				console.log("fetch using local:", filter)
			}

			setComments(prev =>
				pageNumber === 1 ? List : [...prev, ...List]
			);
			setPage(pageNumber);
			setHasMore(pageNumber < totalPages);

		} catch (error) {
			console.error("Failed to fetch students:", error);
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

	const handlePostComment = async () => {
		if (!body.trim()) return Alert.alert("Body is required.");

		try {
			setLoading(true);
			const payload = { content: body, commentable_type: 'App\\Models\\LMS\\ClassFeed', commentable_id: postId };
			await postWallComment(payload);
			fetch(1);
			setBody('')
		} catch (e) {
			handleApiError(e, "Failed to submit post");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
				<View style={{ flex: 1 }}>
					<ScrollView
						contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
						keyboardShouldPersistTaps="handled"
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
						}
					>
						{comments.map((item, index) => (
							<View key={index} style={styles.commentForm}>
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
								<CText fontSize={16} fontStyle={'SB'} style={{ color: '#000', marginLeft: 10 }}>{ item.content }</CText>
							</View>
						))}
					</ScrollView>

						<View
							style={{
								position: 'absolute',
								bottom: 0,
								left: 0,
								right: 0,
								padding: 5,
								backgroundColor: '#fff',
								margin: 10,
								borderWidth: 1,
								borderColor: '#ccc',
								borderRadius: 20,
								elevation: 5,
							}}
						>
							<KeyboardAvoidingView
								behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
								keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 150}
							>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'flex-end',
								}}
							>
								<TextInput
									placeholder="What's on your mind?"
									placeholderTextColor="#616161"
									multiline
									numberOfLines={3}
									value={body}
									onChangeText={setBody}
									style={{
										borderColor: '#ccc',
										borderRadius: 8,
										padding: 10,
										fontSize: 16,
										flex: 1,
										textAlignVertical: 'top',
										marginRight: 8,
										// borderWidth: 1,
										marginBottom: 3,
									}}
								/>
								<CButton
									title={loading ? '...' : 'Post'}
									disabled={loading}
									onPress={handlePostComment}
									type="success"
									style={{
										borderRadius: 15,
										paddingVertical: 10,
										paddingHorizontal: 16,
										// marginTop: 10,
										marginRight: 10,
									}}
									textStyle={{ color: '#fff', fontSize: 16 }}
								/>
							</View>
							</KeyboardAvoidingView>
						</View>
				</View>
		</SafeAreaView>
	);
};


export default WallCommentsScreen;

const styles = StyleSheet.create({
	commentForm: {
		backgroundColor: theme.colors.light.card,
		padding: 5,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
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
