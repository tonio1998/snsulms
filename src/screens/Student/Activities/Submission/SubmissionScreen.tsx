import React, {useCallback, useContext, useEffect, useState} from 'react';
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
import { globalStyles } from '../../../../theme/styles.ts';
import {
	fetchStudentSubmissions, turninSubmission,
	uploadStudentSubmission
} from '../../../../api/modules/submissionApi.ts';
import {handleApiError} from "../../../../utils/errorHandler.ts";
import {theme} from "../../../../theme";
import {CText} from "../../../../components/common/CText.tsx";
import {viewFile} from "../../../../utils/viewFile.ts";
import {formatNumber, getFileSize} from "../../../../utils/format.ts";
import BackHeader from "../../../../components/layout/BackHeader.tsx";
import { pick, types } from '@react-native-documents/picker';
import {useActivity} from "../../../../context/SharedActivityContext.tsx";
import {formatDate} from "../../../../utils/dateFormatter";
import {useLoading} from "../../../../context/LoadingContext.tsx";
import {useAlert} from "../../../../components/CAlert.tsx";
import {NetworkContext} from "../../../../context/NetworkContext.tsx";
import {useAuth} from "../../../../context/AuthContext.tsx";
import {useFocusEffect} from "@react-navigation/native";
import {SubmissionModal} from "../../../../components/SubmissionModal.tsx";

export default function SubmissionScreen({ navigation, route }) {
	const { activity } = useActivity();
	const [ActivityID, setActivityID] = useState(0);
	const [StudentActivityID, setStudentActivityID] = useState(0);
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingSubmissions, setLoadingSubmissions] = useState(false);
	const [submissions, setSubmissions] = useState([]);
	const {showAlert} = useAlert();
	const [attachment, setAttachment] = useState([]);
	const [link, setLink] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [uploading, setUploading] = useState(false);

	const loadSubmissions = async () => {
		try {
			setLoadingSubmissions(true);
			const res = await fetchStudentSubmissions({
				StudentActivityID: StudentActivityID,
				StudentID: user?.conn_id
			});

			console.log(res.data);

			setSubmissions(res.data);
		} catch (err) {
			handleApiError(err, 'Fetch');
		} finally {
			setLoadingSubmissions(false);
		}
	};

	useEffect(() => {
		if (activity?.ActivityID > 0) {
			setActivityID(activity.ActivityID);
			setStudentActivityID(activity.StudentActivityID);
		}
	}, [activity]);

	useEffect(() => {
		if (ActivityID > 0) {
			loadSubmissions();
		}
	}, [ActivityID]);

	useFocusEffect(
		useCallback(() => {
			let isActive = true;
			(async () => {
				loadSubmissions();
			})();
			return () => {
				isActive = false;
			};
		}, [])
	);

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

	const handleAction = async () => {
		try {
			const isSubmitted = activity?.SubmissionType === 'Submitted';
			showLoading(isSubmitted ? 'Withdrawing...' : 'Submitting...');

			const res = await turninSubmission({ ActivityID });

			if (res.success) {
				showAlert(
					'success',
					isSubmitted ? 'Withdrawn' : 'Submitted',
					isSubmitted ? 'Submission has been withdrawn.' : 'Submitted successfully.'
				);
				navigation.goBack();
			} else {
				showAlert('error', 'Error', res.message);
			}
		} catch (e) {
			handleApiError(e, 'Submission failed');
		} finally {
			hideLoading();
		}
	};

	const handleConfirmAction = () => {
		const isSubmitted = activity?.SubmissionType === 'Submitted';

		Alert.alert(
			isSubmitted ? 'Withdraw Submission?' : 'Submit?',
			isSubmitted
				? 'Are you sure you want to withdraw your submission?'
				: 'Are you sure you want to submit?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: isSubmitted ? 'Withdraw' : 'Submit',
					style: isSubmitted ? 'destructive' : 'default',
					onPress: handleAction,
				},
			]
		);
	};

	const renderItem = ({ item }) => {
		const isWebLink = item.Link.startsWith('http://') || item.Link.startsWith('https://');
		return (
			<TouchableOpacity
				style={styles.submissionCard}
				key={item.id}
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
			<BackHeader
				title="Submission"
			/>
				<SafeAreaView style={globalStyles.safeArea}>
					{loadingSubmissions ? (
						<ActivityIndicator size="large" color={theme.colors.light.primary} />
					) : (
						<FlatList
							data={submissions}
							keyExtractor={(item, index) => `${item.id}-${index}`}
							contentContainerStyle={{ padding: 12 }}
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

					<SubmissionModal
						visible={modalVisible}
						onClose={() => setModalVisible(false)}
						link={link}
						setLink={setLink}
						onFileSelect={handleFileSelect}
						onSubmitLink={handleSubmitLink}
						uploading={uploading}
					/>
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
		borderRadius: theme.radius.sm,
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
