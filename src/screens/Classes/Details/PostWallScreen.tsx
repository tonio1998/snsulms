import React, { useContext, useState } from "react";
import {
	View,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	Image,
	StyleSheet,
} from "react-native";
import NetworkContext from "../../../context/NetworkContext";
import {useAuth} from "../../../context/AuthContext.tsx";
import {postWall} from "../../../api/modules/wallApi.ts";
import BackHeader from "../../../components/BackHeader.tsx";
import BackgroundWrapper from "../../../utils/BackgroundWrapper";
import {globalStyles} from "../../../theme/styles.ts";
import {FILE_BASE_URL} from "../../../api/api_configuration.ts";
import {CText} from "../../../components/CText.tsx";
import CButton from "../../../components/CButton.tsx";
import {theme} from "../../../theme";
import {handleApiError} from "../../../utils/errorHandler.ts";

const PostWallScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const network = useContext(NetworkContext);
	const { user } = useAuth();

	const [body, setBody] = useState('');
	const [remark, setRemark] = useState('post');
	const [loading, setLoading] = useState(false);

	const handlePost = async () => {
		if (!body.trim()) return;

		try {
			setLoading(true);
			const payload = { body, remark, ClassID };
			await postWall(payload);
			navigation.goBack();
		} catch (e) {
			handleApiError(e, "Failed to submit post");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<BackHeader title="Create Post" />
				<SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
					<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
						<KeyboardAvoidingView
							style={{ flex: 1, padding: 16 }}
							behavior={Platform.OS === 'ios' ? 'padding' : undefined}
						>
							<View style={styles.postCard}>
								{/* User Info */}
								<View style={styles.userRow}>
									<Image
										source={
											user?.profile_pic
												? { uri: `${FILE_BASE_URL}/${user?.profile_pic}` }
												: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random` }
										}
										style={styles.avatar}
									/>
									<View style={{ marginLeft: 10 }}>
										<CText fontSize={14.5} fontStyle="SB">{user?.name}</CText>
										<CText fontSize={12} color="#888">{user?.email}</CText>
									</View>
								</View>

								{/* Text Input */}
								<TextInput
									placeholder="What's on your mind?"
									placeholderTextColor="#616161"
									multiline
									numberOfLines={5}
									value={body}
									onChangeText={setBody}
									style={styles.textInput}
								/>

								{/* Optional Post Types (Future use) */}
								{/* <View style={styles.typeSwitch}>
									{['post', 'schedule', 'draft'].map((type) => (
										<TouchableOpacity
											key={type}
											onPress={() => setRemark(type)}
											style={[
												styles.typeBtn,
												remark === type && styles.activeType
											]}
										>
											<CText style={{ color: remark === type ? '#fff' : '#000' }}>
												{type}
											</CText>
										</TouchableOpacity>
									))}
								</View> */}

								{/* Submit Button */}
								<CButton
									title={loading ? "Posting..." : "Post"}
									disabled={loading}
									onPress={handlePost}
									type="success"
									style={{ borderRadius: 8, paddingVertical: 12, marginTop: 10 }}
								/>
							</View>
						</KeyboardAvoidingView>
					</ScrollView>
				</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	postCard: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 12,
		elevation: 1,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	userRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
	},
	avatar: {
		width: 45,
		height: 45,
		borderRadius: 22.5,
		backgroundColor: '#ccc',
	},
	textInput: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		padding: 12,
		fontSize: 15,
		minHeight: 120,
		textAlignVertical: 'top',
		backgroundColor: '#f9f9f9',
	},

	typeSwitch: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 12,
	},
	typeBtn: {
		backgroundColor: '#ddd',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
	},
	activeType: {
		backgroundColor: theme.colors.light.primary,
	},
});

export default PostWallScreen;
