import React, { useContext, useEffect, useState } from 'react';
import {
	Alert,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Linking,
	Platform,
	RefreshControl,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BackHeader from '../../../../components/layout/BackHeader.tsx';
import { CText } from '../../../../components/common/CText.tsx';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import { NetworkContext } from '../../../../context/NetworkContext.tsx';
import { useLoading } from '../../../../context/LoadingContext.tsx';
import { useAuth } from '../../../../context/AuthContext.tsx';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { viewFile } from '../../../../utils/viewFile.ts';
import { getFileSize } from '../../../../utils/format.ts';
import {
	fetchStudentResponses,
	fetchStudentSubmissions,
	saveStudentGrade
} from '../../../../api/modules/submissionApi.ts';

const SubmissionDetailsScreen = ({ navigation, route }) => {
	const StudentActivityID = route.params.StudentActivityID;
	const { user } = useAuth();
	const network = useContext(NetworkContext);
	const { showLoading, hideLoading } = useLoading();

	const [loading, setLoading] = useState(false);
	const [submission, setSubmission] = useState(null);
	const [attachment, setAttachment] = useState([]);
	const [gradeInput, setGradeInput] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const fetchData = async () => {
		try {
			setLoading(true);
			showLoading('Loading...');
			const res = await fetchStudentResponses({ StudentActivityID });
			setSubmission(res);
			if (res?.StudentID) {
				const att = await fetchStudentSubmissions({ StudentActivityID, StudentID: res.StudentID });
				setAttachment(att.data || []);
			}
			setGradeInput(res?.Grade ? res.Grade.toString() : '');
		} catch (err) {
			handleApiError(err, 'Fetch Error');
		} finally {
			hideLoading();
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchData();
		setRefreshing(false);
	};

	const handleSubmitGrade = async () => {
		if (!gradeInput.trim()) return Alert.alert('Error', 'Please enter a grade.');
		const gradeValue = Number(gradeInput.trim());
		if (gradeValue > submission?.activity?.Points) {
			return Alert.alert('Error', 'Grade cannot be greater than the maximum points.');
		}

		try {
			showLoading('Submitting...');
			setSubmitting(true);
			await saveStudentGrade({
				StudentActivityID,
				Grade: gradeInput
			});
			Alert.alert('Success', 'Grade submitted successfully.');
			navigation.goBack();
		} catch (err) {
			handleApiError(err, 'Submit');
		} finally {
			setSubmitting(false);
			hideLoading();
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const renderItem = ({ item }) => {
		const isWebLink = item.Link.startsWith('http');
		return (
			<TouchableOpacity
				style={styles.submissionCard}
				onPress={() => {
					if (isWebLink) {
						Linking.openURL(item.Link).catch(() =>
							Alert.alert('Error', 'Unable to open the link.')
						);
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
			<BackHeader />
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={{ flex: 1 }}>
						<SafeAreaView style={globalStyles.safeArea}>
							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={{ paddingBottom: 120 }}
								refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
							>
								<View style={styles.contentWrapper}>
									{/* Profile */}
									<View style={styles.profileCard}>
										<Image
											source={
												submission?.student_info?.user?.profile_pic
													? { uri: submission.student_info.user.profile_pic }
													: submission?.student_info?.user?.avatar
														? { uri: submission.student_info.user.avatar }
														: {
															uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
																submission?.student_info?.user?.name || 'User'
															)}&background=random`
														}
											}
											style={styles.avatar}
										/>
										<View style={styles.profileInfo}>
											<CText style={styles.nameText}>
												{submission?.student_info?.FirstName} {submission?.student_info?.LastName}
											</CText>
											<CText style={styles.subText}>
												{submission?.student_info?.user?.email}
											</CText>
										</View>
									</View>

									{/* Attachments */}
									<CText fontStyle="SB" fontSize={16} style={{ marginBottom: 10 }}>
										Attachments
									</CText>

									{attachment.length > 0 ? (
										attachment.map((item, index) => renderItem({ item, index }))
									) : (
										<Text style={styles.emptyText}>No attachments found.</Text>
									)}
								</View>
							</ScrollView>

							{/* Grade Input */}
							<View style={styles.fixedGradeInput}>
								<View style={globalStyles.cardRow}>
									<CText fontStyle="SB" fontSize={16} style={{ marginBottom: 8 }}>
										Enter Score
									</CText>
									<CText fontStyle="SB" fontSize={16} style={{ marginBottom: 8 }}>
										Point: {submission?.activity?.Points}
									</CText>
								</View>

								<View style={styles.inputRow}>
									<TextInput
										style={styles.flexGradeInput}
										value={gradeInput}
										keyboardType="numeric"
										onChangeText={setGradeInput}
										placeholder="e.g. 100"
										placeholderTextColor="#999"
									/>
									<TouchableOpacity
										style={styles.iconButton}
										onPress={handleSubmitGrade}
										disabled={submitting}
									>
										<Icon
											name={submitting ? 'cloud-upload-outline' : 'checkmark-circle-outline'}
											size={24}
											color="#fff"
										/>
									</TouchableOpacity>
								</View>
							</View>
						</SafeAreaView>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</>
	);
};

const styles = StyleSheet.create({
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	flexGradeInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		fontSize: 22,
		fontWeight: '700',
		color: '#111827',
		marginRight: 10,
	},
	iconButton: {
		backgroundColor: theme.colors.light.primary,
		padding: 10,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	fixedGradeInput: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#fff',
		padding: 12,
		borderTopWidth: 1,
		borderColor: '#e5e7eb',
	},
	contentWrapper: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 10,
	},
	profileCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 12,
		marginBottom: 14,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	profileInfo: {
		marginLeft: 10,
		flex: 1,
	},
	avatar: {
		width: 54,
		height: 54,
		borderRadius: 27,
		backgroundColor: '#d1d5db',
	},
	nameText: {
		fontWeight: '600',
		fontSize: 15,
		color: '#111827',
	},
	subText: {
		fontSize: 13,
		color: '#6b7280',
		marginTop: 2,
	},
	submissionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		marginBottom: 8,
		elevation: 1,
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowRadius: 1,
	},
	emptyText: {
		textAlign: 'center',
		paddingVertical: 24,
		color: '#9ca3af',
		fontSize: 13,
	},
});

export default SubmissionDetailsScreen;
