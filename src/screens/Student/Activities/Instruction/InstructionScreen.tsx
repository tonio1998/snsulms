import React, { useContext, useEffect, useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Image,
	StyleSheet,
	ActivityIndicator,
	Linking,
	Alert, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../../context/AuthContext.tsx';
import { NetworkContext } from '../../../../context/NetworkContext.tsx';
import { useLoading } from '../../../../context/LoadingContext.tsx';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import BackHeader from '../../../../components/layout/BackHeader.tsx';
import { CText } from '../../../../components/common/CText.tsx';
import { formatDate } from '../../../../utils/dateFormatter';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { fetchClassAttachments } from '../../../../api/modules/activitiesApi.ts';
import { getFileSize, formatNumber } from '../../../../utils/format.ts';
import { viewFile } from '../../../../utils/viewFile.ts';
import { turninSubmission } from '../../../../api/modules/submissionApi.ts';
import { useAlert } from '../../../../components/CAlert.tsx';
import { useActivity } from '../../../../context/SharedActivityContext.tsx';
import CButton from '../../../../components/buttons/CButton.tsx';

const InstructionScreen = ({ navigation }) => {
	const { activity, refreshFromOnline } = useActivity();
	const [ActivityID, setActivityID] = useState(0);
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [submissions, setSubmissions] = useState([]);
	const { showAlert } = useAlert();
	const [loadingSubmissions, setLoadingSubmissions] = useState(false);

	console.log("activity", activity);

	const loadSubmissions = async () => {
		setLoading(true);
		try {
			setLoadingSubmissions(true);
			const res = activity?.files || [];
			setSubmissions(res);
		} catch (err) {
			handleApiError(err, 'Fetch');
		} finally {
			setLoadingSubmissions(false);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (activity?.ActivityID) {
			setActivityID(activity.ActivityID);
		}
	}, [activity]);

	useEffect(() => {
		if (ActivityID) {
			loadSubmissions();
		}
	}, [ActivityID]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refreshFromOnline();
		if (ActivityID) {
			await loadSubmissions();
		}
		setRefreshing(false);
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
				{ text: isSubmitted ? 'Withdraw' : 'Submit', onPress: handleAction },
			]
		);
	};

	const openAttachment = (item) => {
		const isWebLink = item.Link.startsWith('http');
		if (isWebLink) {
			Linking.openURL(item.Link).catch(() => Alert.alert('Error', 'Failed to open link'));
		} else {
			viewFile(item.Link, item.Title);
		}
	};

	return (
		<>
			<SafeAreaView style={[globalStyles.safeArea]}>
				<BackHeader
					title="Instruction"
					rightButton={
						activity?.SubmissionType !== 'Submitted' && activity?.created_by !== user?.id && (
							<TouchableOpacity
								style={[
									styles.submitBtn,
									{
										backgroundColor:
											activity?.SubmissionType === 'Submitted'
												? theme.colors.light.danger
												: theme.colors.light.primary,
									},
								]}
								onPress={handleConfirmAction}
								activeOpacity={0.7}
							>
								<Icon
									name={activity?.SubmissionType === 'Submitted' ? 'close-outline' : 'checkmark-circle'}
									size={18}
									color="#fff"
								/>
								<CText fontStyle="SB" fontSize={14} style={{ color: '#fff', marginLeft: 6 }}>
									{activity?.SubmissionType === 'Submitted' ? 'Withdraw' : 'Turn In'}
								</CText>
							</TouchableOpacity>
						)
					}
				/>

				<ScrollView
					contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
				>
					<View style={styles.card}>
						{activity?.activity?.topic?.Title && (
							<CText fontSize={13} style={styles.topicLabel}>
								Topic: {activity.activity.topic.Title}
							</CText>
						)}
						<CText fontSize={20} fontStyle="SB" style={styles.title}>
							{activity?.activity?.Title}
						</CText>
						{activity?.activity?.Description ? (
							<>
								<CText fontSize={13} style={styles.sectionLabel}>
									Instruction:
								</CText>
								<CText style={styles.description}>{activity.activity.Description}</CText>
							</>
						) : null}
						{activity?.activity?.DueDate && (
							<>
								<CText fontSize={13} style={styles.sectionLabel}>
									Due Date:
								</CText>
								<CText style={styles.description}>{formatDate(activity.activity.DueDate)}</CText>
							</>
						)}
						{activity?.DateSubmitted && (
							<>
								<CText fontSize={13} style={styles.sectionLabel}>
									Date Submitted
								</CText>
								<CText style={styles.description}>{formatDate(activity.DateSubmitted)}</CText>
							</>
						)}

						<View style={styles.pointsContainer}>
							{activity?.activity?.Points > 0 && (
								<View style={styles.pointsBox}>
									<CText fontSize={22} fontStyle="SB" style={{ color: theme.colors.light.primary }}>
										{formatNumber(activity.activity.Points)}
									</CText>
									<CText fontSize={13} style={styles.pointsLabel}>
										Points
									</CText>
								</View>
							)}
							{activity?.Grade > 0 && (
								<View style={styles.pointsBox}>
									<CText fontSize={22} fontStyle="SB" style={{ color: theme.colors.light.primary }}>
										{formatNumber(activity.Grade)}
									</CText>
									<CText fontSize={13} style={styles.pointsLabel}>
										Points Earned
									</CText>
								</View>
							)}
						</View>
					</View>

					<CText fontSize={18} fontStyle="SB" style={{ marginBottom: 12 }}>
						Instructor
					</CText>
					<View style={[styles.card, styles.instructorCard]}>
						{!activity?.activity?.teacher?.users?.name ? (
							<View style={styles.profileRow}>
								<View style={[styles.avatar, styles.avatarPlaceholder]} />
								<View style={{ marginLeft: 14, flex: 1 }}>
									<View style={[styles.shimmerPlaceholder, { width: 160, height: 18, marginBottom: 8 }]} />
									<View style={[styles.shimmerPlaceholder, { width: 120, height: 14 }]} />
								</View>
							</View>
						) : (
							<View style={styles.profileRow}>
								<Image
									source={{
										uri:
											activity.activity.teacher.users.avatar ||
											`https://ui-avatars.com/api/?name=${encodeURIComponent(
												activity.activity.teacher.users.name || 'User'
											)}`,
									}}
									style={styles.avatar}
								/>
								<View style={{ marginLeft: 14, flex: 1 }}>
									<CText fontSize={17} fontStyle="SB" style={{ color: '#222' }}>
										{activity.activity.teacher.users.name}
									</CText>
									<CText fontSize={14} style={{ color: '#555', marginTop: 2 }}>
										{activity.activity.teacher.users.email}
									</CText>
								</View>
							</View>
						)}
					</View>

					<CText fontSize={18} fontStyle="SB" style={{ marginBottom: 12, marginTop: 8 }}>
						Attachments
					</CText>

					{activity?.activity?.QuizID > 0 && (
						<View style={{ marginBottom: 16 }}>
							<CButton
								type={'success'}
								title="Go to Quiz"
								style={{ padding: 12}}
								onPress={() => navigation.navigate('QuizScreen', { QuizID: activity.activity.QuizID })}
							/>
						</View>
					)}

					{loading ? (
						<ActivityIndicator size="large" color={theme.colors.light.primary} style={{ marginTop: 20 }} />
					) : submissions.length === 0 ? (
						<CText style={{ color: '#888', fontStyle: 'italic' }}>No attachments found.</CText>
					) : (
						submissions.map((item) => (
							<TouchableOpacity
								key={item?.id}
								style={styles.attachmentRow}
								activeOpacity={0.7}
								onPress={() => openAttachment(item)}
							>
								<Icon name="document-outline" size={22} color={theme.colors.light.primary} />
								<View style={styles.attachmentInfo}>
									<CText numberOfLines={1} style={styles.attachmentTitle}>
										{item?.Title}
									</CText>
									<CText style={styles.attachmentDetails}>
										{item?.provider.toUpperCase()} • {getFileSize(item?.FileSize)}
									</CText>
								</View>
								<Icon name="chevron-forward" size={20} color="#bbb" />
							</TouchableOpacity>
						))
					)}
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	submitBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
	},
	card: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 8,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOpacity: 0.07,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	topicLabel: {
		color: '#666',
		marginBottom: 6,
	},
	title: {
		color: '#222',
		marginBottom: 10,
	},
	sectionLabel: {
		color: '#444',
		marginTop: 12,
		marginBottom: 6,
		fontWeight: '600',
	},
	description: {
		color: '#444',
		lineHeight: 20,
	},
	pointsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 20,
	},
	pointsBox: {
		alignItems: 'center',
	},
	pointsLabel: {
		color: '#666',
	},
	instructorCard: {
		paddingVertical: 16,
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#ddd',
	},
	avatarPlaceholder: {
		backgroundColor: '#ccc',
	},
	shimmerPlaceholder: {
		backgroundColor: '#eee',
		borderRadius: 8,
	},
	attachmentRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: '#fafafa',
		borderRadius: 12,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		elevation: 2,
	},
	attachmentInfo: {
		flex: 1,
		marginLeft: 12,
	},
	attachmentTitle: {
		color: '#222',
		fontWeight: '600',
		fontSize: 15,
	},
	attachmentDetails: {
		color: '#777',
		marginTop: 2,
		fontSize: 13,
	},
});

export default InstructionScreen;
