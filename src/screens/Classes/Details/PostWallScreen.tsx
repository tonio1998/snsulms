import {
	Alert,
	Image,
	KeyboardAvoidingView, Platform,
	SafeAreaView,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import {globalStyles} from "../../../theme/styles.ts";
import {handleApiError} from "../../../utils/errorHandler.ts";
import React, {useContext, useState} from "react";
import {useAuth} from "../../../context/AuthContext.tsx";
import {NetworkContext} from "../../../context/NetworkContext.tsx";
import styles from "react-native-webview/lib/WebView.styles";
import {CText} from "../../../components/CText.tsx";
import {theme} from "../../../theme";
import CButton from "../../../components/CButton.tsx";
import {postWall} from "../../../api/modules/wallApi.ts";
import {FILE_BASE_URL} from "../../../api/api_configuration.ts";

const PostWallScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const network = useContext(NetworkContext);
	const { user } = useAuth();

	const [body, setBody] = useState('');
	const [remark, setRemark] = useState('post');
	const [loading, setLoading] = useState(false);

	const handlePost = async () => {
		if (!body.trim()) return false;

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
		<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 0 }]}>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					style={{ flex: 1 }}
					>
					<View style={[globalStyles.shadowBtn, { padding: 16}]}>
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
									style={{
										width: 50,
										height: 50,
										borderRadius: 30,
										marginRight: 6,
										backgroundColor: '#ccc',
										borderWidth: 1,
									}}
								/>
								<View>
									<CText fontSize={18} fontStyle={'SB'} style={{ color: '#000', marginLeft: 10 }}>{ user?.name }</CText>
									<CText fontSize={14} style={{ color: '#000', marginLeft: 10, marginTop: -5 }}>{ user?.email }</CText>
								</View>
							</View>
						</View>
					</View>
					<View>
						<TextInput
							placeholder="What's on your mind?"
							placeholderTextColor="#616161"
							multiline
							numberOfLines={5}
							value={body}
							onChangeText={setBody}
							style={{
								borderWidth: 1,
								borderColor: '#ccc',
								borderRadius: 8,
								padding: 10,
								textAlignVertical: 'top',
								marginBottom: 16,
								minHeight: 300,
								fontSize: 18,
								fontWeight: 'semibold'
							}}
						/>

						{/*<View style={{ marginBottom: 16 }}>*/}
						{/*	<View style={{ flexDirection: 'row', gap: 10 }}>*/}
						{/*		{['post', 'schedule', 'draft'].map((type) => (*/}
						{/*			<TouchableOpacity*/}
						{/*				key={type}*/}
						{/*				onPress={() => setRemark(type)}*/}
						{/*				style={{*/}
						{/*					backgroundColor: remark === type ? theme.colors.light.primary : '#ddd',*/}
						{/*					paddingHorizontal: 12,*/}
						{/*					paddingVertical: 8,*/}
						{/*					borderRadius: 20,*/}
						{/*				}}*/}
						{/*			>*/}
						{/*				<CText style={{ color: remark === type ? '#fff' : '#000' }}>*/}
						{/*					{type}*/}
						{/*				</CText>*/}
						{/*			</TouchableOpacity>*/}
						{/*		))}*/}
						{/*	</View>*/}
						{/*</View>*/}

						<CButton
							title={loading ? "Posting..." : "Post"}
							disabled={loading}
							onPress={handlePost}
							type="success"
							style={{ borderRadius: 8, paddingVertical: 12 }}
						/>
					</View>
				</KeyboardAvoidingView>
			</ScrollView>
		</SafeAreaView>
	);
};


export default PostWallScreen;