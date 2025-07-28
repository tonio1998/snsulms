import React, {useContext, useEffect, useState} from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	TextInput,
	Alert,
	SafeAreaView, ToastAndroid, ActivityIndicator, Linking, FlatList, RefreshControl, Dimensions, ScrollView, Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../../theme/styles.ts';
import {
	fetchStudentSubmissions,
	uploadStudentSubmission
} from '../../../api/modules/submissionApi.ts';
import {handleApiError} from "../../../utils/errorHandler.ts";
import {theme} from "../../../theme";
import {CText} from "../../../components/CText.tsx";
import {viewFile} from "../../../utils/viewFile.ts";
import {formatNumber, getFileSize} from "../../../utils/format.ts";
import BackHeader from "../../../components/BackHeader.tsx";
import { pick, types } from '@react-native-documents/picker';
import {useActivity} from "../../../context/SharedActivityContext.tsx";
import {formatDate} from "../../../utils/dateFormatter";

export default function SubmissionScreen({ navigation, route }) {
	const StudentActivityID = route.params.StudentActivityID;
	const ActivityID = route.params.ActivityID;
	const { activity, loading } = useActivity();

	const [modalVisible, setModalVisible] = useState(false);
	const [link, setLink] = useState('');
	const [uploading, setUploading] = useState(false);
	const [loadingSubmissions, setLoadingSubmissions] = useState(false);
	const [submissions, setSubmissions] = useState([]);

	const handleFileSelect = async () => {
		try {
			const result = await pick({
				type: ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'],
			});
			if (!result.length) return;

			const file = result[0];
			if (file.size > 10 * 1024 * 1024) {
				Alert.alert('File too large', 'Max size is 10MB');
				return;
			}

			const formData = new FormData();
			formData.append('file', {
				uri: file.uri,
				type: file.type,
				name: file.name,
			});
			formData.append('ActivityID', ActivityID.toString());

			setUploading(true);
			const response = await uploadStudentSubmission(formData);
			await loadSubmissions();
			setUploading(false);

			ToastAndroid.show(
				response?.success ? 'File uploaded successfully.' : (response?.message || 'Server rejected the file.'),
				ToastAndroid.SHORT
			);
		} catch (error) {
			setUploading(false);
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
		formData.append('ActivityID', ActivityID.toString());

		try {
			setUploading(true);
			const response = await uploadStudentSubmission(formData);
			await loadSubmissions();
			setUploading(false);

			ToastAndroid.show(
				response?.success ? 'Link submitted successfully' : (response?.message || 'Server rejected the link.'),
				ToastAndroid.SHORT
			);
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
			const res = await fetchStudentSubmissions({ ActivityID });
			setSubmissions(res.data);
		} catch (err) {
			handleApiError(err, 'Fetch');
		} finally {
			setLoadingSubmissions(false);
		}
	};

	useEffect(() => {
		loadSubmissions();
	}, []);

	const renderItem = ({ item }) => {
		const isWebLink = item.Link.startsWith('http://') || item.Link.startsWith('https://');
		return (
			<TouchableOpacity
				style={styles.submissionCard}
				onPress={() => {
					if (isWebLink) {
						Linking.openURL(item.Link).catch(() => Alert.alert('Error', 'Unable to open the link.'));
					} else {
						viewFile(item.Link, item.Title);
					}
				}}
			>
				<Icon name="document-outline" size={22} color="#555" />
				<View style={{ marginLeft: 12, flex: 1 }}>
					<CText fontSize={16} fontStyle="SB" numberOfLines={1} style={{ color: '#000' }}>
						{item.Title}
					</CText>
					{item.FileSize && (
						<Text style={styles.subText}>Size: {getFileSize(item.FileSize)}</Text>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<>
			<BackHeader title="Submission" />
				<SafeAreaView style={globalStyles.safeArea}>
					{loadingSubmissions ? (
						<ActivityIndicator size="large" color={theme.colors.light.card} />
					) : (
						<FlatList
							data={submissions}
							keyExtractor={(item, index) => `${item.id}-${index}`}
							contentContainerStyle={{ padding: 12 }}
							ListEmptyComponent={
								<View style={styles.emptyState}>
									<Text style={styles.emptyText}>No submissions yet.</Text>
								</View>
							}
							refreshControl={
								<RefreshControl refreshing={loadingSubmissions} onRefresh={loadSubmissions} />
							}
							renderItem={renderItem}
						/>
					)}

					{activity?.SubmissionType !== 'Submitted' && (
						<TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
							<Icon name="cloud-upload-outline" size={28} color="#fff" />
						</TouchableOpacity>
					)}

					<Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
						<View style={styles.modalOverlay}>
							<View style={styles.modalContent}>
								<Text style={styles.modalTitle}>Choose Submission Type</Text>

								<TouchableOpacity style={styles.optionBtn} onPress={handleFileSelect} disabled={uploading}>
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

								<TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
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
	submissionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
		marginBottom: 10,
		backgroundColor: '#fff',
		borderRadius: 10,
		elevation: 1,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
	},
	subText: {
		fontSize: 12,
		color: '#777',
		marginTop: 2,
	},
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 160,
	},
	emptyText: {
		color: '#999',
		fontSize: 16,
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
		backgroundColor: 'rgba(0,0,0,0.4)',
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
		marginBottom: 16,
	},
	optionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
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
		color: '#333',
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
