import React, {useEffect, useState} from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	TextInput,
	Alert,
	SafeAreaView, ToastAndroid, ActivityIndicator, Linking, FlatList, RefreshControl, Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { pick, types } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../../theme/styles.ts';
import {
	fetchStudentSubmissions,
	uploadStudentSubmission,
	useStudentSubmissions
} from '../../../api/modules/submissionApi.ts';
import {handleApiError} from "../../../utils/errorHandler.ts";
import {theme} from "../../../theme";
import {CText} from "../../../components/CText.tsx";
import {API_BASE_URL} from "../../../api/api_configuration.ts";
import {viewFile} from "../../../utils/viewFile.ts";
import {formatNumber, getFileSize} from "../../../utils/format.ts";

export default function SubmissionScreen({ navigation, route }) {
	const StudentActivityID = route.params.StudentActivityID;

	const [modalVisible, setModalVisible] = useState(false);
	const [link, setLink] = useState('');
	const [uploading, setUploading] = useState(false);
	const [loadingSubmissions, setLoadingSubmissions] = useState(false);
	const [ submissions, setSubmissions ] = useState([]);


	const handleFileSelect = async () => {
		try {
			const result = await pick({
				type: [
					'application/pdf',
					'image/png',
					'image/jpg',
					'image/jpeg',
					'image/webp',
					'image/gif',
				],
			});
			if (!result.length) return;

			const file = result[0];

			if (file.size && file.size > 10 * 1024 * 1024) {
				Alert.alert('File too large', 'Max size is 10MB');
				return;
			}

			const fileData = {
				uri: file.uri,
				type: file.type,
				name: file.name,
			};

			const formData = new FormData();
			formData.append('file', fileData as any);
			formData.append('StudentActivityID', StudentActivityID.toString());

			setUploading(true);
			const response = await uploadStudentSubmission(formData);
			loadSubmissions()
			setUploading(false);

			if (response?.success) {
				ToastAndroid.show('File uploaded successfully.', ToastAndroid.SHORT);
			} else {
				ToastAndroid.show(response?.message || 'Server rejected the file.', ToastAndroid.SHORT);
			}
		} catch (error) {
			setUploading(false);
			console.error('Upload error:', error);
			handleApiError(error, 'Upload');
		} finally {
			setModalVisible(false);
		}
	};


	const handleSubmitLink = async () => {
		if (!link.trim()) {
			ToastAndroid.show('Please enter a valid link.', ToastAndroid.SHORT);
			return;
		}

		const formData = new FormData();
		formData.append('link', link);
		formData.append('StudentActivityID', StudentActivityID.toString());

		try {
			setUploading(true);
			const response = await uploadStudentSubmission(formData);
			loadSubmissions()
			setUploading(false);

			if (response?.success) {
				ToastAndroid.show('Link submitted successfully', ToastAndroid.SHORT);
			} else {
				ToastAndroid.show(response?.message || 'Server rejected the link.', ToastAndroid.SHORT);
			}
		} catch (error) {
			setUploading(false);
			ToastAndroid.show('Something went wrong.', ToastAndroid.SHORT);
		} finally {
			setLink('');
			setModalVisible(false);
		}
	};

	const loadSubmissions = async () => {
		try {
			setLoadingSubmissions(true);
			const data = { StudentActivityID };
			const res = await fetchStudentSubmissions(data);
			console.log('submissions:', res);
			setSubmissions(res.data);
		} catch (err) {
			console.error('Fetch error:', err);
			handleApiError(err, 'Fetch');
		} finally {
			setLoadingSubmissions(false);
		}
	};

	useEffect(() => {
		loadSubmissions();
	}, []);

	let ScreenWidth = Dimensions.get('window').width;
	return (
		<>
			<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 0 }]}>
				{loadingSubmissions ? (
					<ActivityIndicator color={theme.colors.light.primary} />
				) : (
					<FlatList
						data={submissions}
						keyExtractor={(item, index) => `${item.id}-${index}`}
						ListEmptyComponent={
							<Text style={{ color: '#999', padding: 10 }}>No submissions yet.</Text>
						}
						refreshControl={
							<RefreshControl refreshing={loadingSubmissions} onRefresh={loadSubmissions} />
						}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => {
									const isWebLink =
										item.Link.startsWith('http://') || item.Link.startsWith('https://');

									if (isWebLink) {
										Linking.openURL(item.Link).catch(() => {
											Alert.alert('Error', 'Unable to open the link.');
										});
									} else {
										viewFile(item.Link, item.Title);
									}
								}}
								style={styles.submissionItem}
							>
								<Icon name="document-outline" size={18} color="#555" />
								<View style={{ marginLeft: 10 }}>
									<CText
										numberOfLines={1}
										fontSize={16}
										fontStyle={'SB'}
										style={{ color: '#000', width: ScreenWidth - 70 }}
									>
										{item.Title}
									</CText>
									{item.FileSize && <Text style={{ fontSize: 12, color: '#777' }}>Size: {getFileSize(item.FileSize ?? 0)} </Text>}
								</View>
							</TouchableOpacity>
						)}

					/>
				)}

				<TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
					<Icon name="cloud-upload-outline" size={28} color="#fff" />
				</TouchableOpacity>

				<Modal
					visible={modalVisible}
					transparent
					animationType="slide"
					onRequestClose={() => setModalVisible(false)}
				>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>Choose Submission Type</Text>

							<TouchableOpacity style={styles.optionBtn} onPress={handleFileSelect}>
								<Icon name="document-text-outline" size={20} color="#333" />
								<Text style={styles.optionText}>
									{uploading ? 'Uploading...' : 'Upload PDF or Image (max 10MB)'}
								</Text>
							</TouchableOpacity>

							<View style={{ marginTop: 20 }}>
								<Text style={styles.linkLabel}>Or submit a link:</Text>
								<TextInput
									placeholder="https://example.com"
									value={link}
									onChangeText={setLink}
									style={styles.input}
									autoCapitalize="none"
								/>
								<TouchableOpacity style={styles.submitBtn} onPress={handleSubmitLink}>
									<Text style={styles.submitBtnText}>Submit Link</Text>
								</TouchableOpacity>
							</View>

							<TouchableOpacity
								style={styles.cancelBtn}
								onPress={() => setModalVisible(false)}
							>
								<Text style={styles.cancelText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</SafeAreaView>
		</>
	);
}



const styles = StyleSheet.create({
	submissionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		backgroundColor: '#fff',

	},
	submissionText: {
		fontSize: 14,
		color: '#333',
		width: 250,
	},

	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff',
	},
	label: {
		fontSize: 16,
		color: '#333',
		marginTop: 20,
	},
	fab: {
		position: 'absolute',
		bottom: 30,
		right: 30,
		backgroundColor: theme.colors.light.primary,
		borderRadius: 50,
		padding: 16,
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalContent: {
		backgroundColor: '#fff',
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 20,
	},
	optionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#eaeaea',
		padding: 12,
		borderRadius: 10,
	},
	optionText: {
		marginLeft: 10,
		fontSize: 16,
		color: '#333',
	},
	linkLabel: {
		fontSize: 14,
		marginBottom: 6,
	},
	input: {
		backgroundColor: '#f2f2f2',
		padding: 10,
		borderRadius: 8,
	},
	submitBtn: {
		backgroundColor: '#28a745',
		padding: 12,
		marginTop: 10,
		borderRadius: 10,
		alignItems: 'center',
	},
	submitBtnText: {
		color: '#fff',
		fontWeight: '600',
	},
	cancelBtn: {
		marginTop: 20,
		alignItems: 'center',
	},
	cancelText: {
		color: 'red',
		fontSize: 14,
	},
});
