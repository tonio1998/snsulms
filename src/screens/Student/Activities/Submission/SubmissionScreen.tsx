import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Alert,
	SafeAreaView,
	ToastAndroid,
	ActivityIndicator,
	Linking,
	FlatList,
	RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../../../theme/styles.ts';
import {
	fetchStudentSubmissions,
	turninSubmission,
	uploadStudentSubmission
} from '../../../../api/modules/submissionApi.ts';
import {handleApiError} from "../../../../utils/errorHandler.ts";
import {theme} from "../../../../theme";
import {CText} from "../../../../components/common/CText.tsx";
import {viewFile} from "../../../../utils/viewFile.ts";
import {getFileSize} from "../../../../utils/format.ts";
import BackHeader from "../../../../components/layout/BackHeader.tsx";
import { pick } from '@react-native-documents/picker';
import {useActivity} from "../../../../context/SharedActivityContext.tsx";
import {useLoading} from "../../../../context/LoadingContext.tsx";
import {useAlert} from "../../../../components/CAlert.tsx";
import {NetworkContext} from "../../../../context/NetworkContext.tsx";
import {useAuth} from "../../../../context/AuthContext.tsx";
import {useFocusEffect} from "@react-navigation/native";
import {SubmissionModal} from "../../../../components/SubmissionModal.tsx";
import {
	loadStudentActivityToLocal,
	saveStudentActivityToLocal
} from "../../../../utils/cache/Student/localStudentActivity";
import {LastUpdatedBadge} from "../../../../components/common/LastUpdatedBadge";
import {useLoading2} from "../../../../context/Loading2Context.tsx";

export default function SubmissionScreen({ navigation, route }) {
	const { activity, refreshFromOnline } = useActivity();

	const [ActivityID, setActivityID] = useState(0);
	const [StudentActivityID, setStudentActivityID] = useState(0);
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [loadingSubmissions, setLoadingSubmissions] = useState(false);
	const [submissions, setSubmissions] = useState([]);
	const {showAlert} = useAlert();
	const [link, setLink] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [lastFetched, setLastFetched] = useState(null);
	const { showLoading2, hideLoading2 } = useLoading2();
	const loadLocalSubmissions = async () => {
		showLoading2('Loading submissions...');
		try {
			setLoadingSubmissions(true);
			const { data, date } = await loadStudentActivityToLocal(StudentActivityID);
			if (data?.student_info) {
				console.log("data", data);
				setLastFetched(date);
				setSubmissions(data?.st_attachments || []);
			} else {
				await loadSubmissions();
			}
		} catch (error) {
		} finally {
			setLoadingSubmissions(false);
			hideLoading2();
		}
	};

	const loadSubmissions = async () => {
		try {
			setLoadingSubmissions(true);
			refreshFromOnline();
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
			loadLocalSubmissions();
		}
	}, [activity]);

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
			formData.append('StudentActivityID', StudentActivityID.toString());
			formData.append('ActivityID', ActivityID.toString());

			setUploading(true);
			const response = await uploadStudentSubmission(formData);

			if (response.success && response.data) {
				setSubmissions(prev => [response.data, ...prev]);
				ToastAndroid.show('File uploaded successfully.', ToastAndroid.SHORT);
			} else {
				ToastAndroid.show(response?.message || 'Server rejected the file.', ToastAndroid.SHORT);
			}
		} catch (error) {
			handleApiError(error, 'Upload');
		} finally {
			setUploading(false);
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
		formData.append('ActivityID', ActivityID.toString());

		try {
			setUploading(true);
			const response = await uploadStudentSubmission(formData);

			if (response.success && response.data) {
				setSubmissions(prev => [response.data, ...prev]); // Update immediately
				ToastAndroid.show('Link submitted successfully', ToastAndroid.SHORT);
			} else {
				ToastAndroid.show(response?.message || 'Server rejected the link.', ToastAndroid.SHORT);
			}
		} catch (error) {
			ToastAndroid.show('Something went wrong.', ToastAndroid.SHORT);
		} finally {
			setUploading(false);
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
			<BackHeader title="Submission" />
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 100}]}>
				<View style={{ paddingHorizontal: 10 }}>
					<LastUpdatedBadge
						date={lastFetched}
						onReload={loadSubmissions}
					/>
				</View>
				<FlatList
					data={submissions}
					keyExtractor={(item, index) => `${item.id}-${index}`}
					contentContainerStyle={{ padding: 12 }}
					refreshControl={
						<RefreshControl refreshing={loadingSubmissions} onRefresh={loadSubmissions} />
					}
					ListEmptyComponent={<CText fontSize={15} style={{ textAlign: 'center' }}>No submissions yet.</CText>}
					renderItem={renderItem}
				/>

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
});
