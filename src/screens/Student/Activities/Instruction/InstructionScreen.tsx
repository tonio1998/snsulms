import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Image,
	StyleSheet,
	ActivityIndicator,
	Linking,
	Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { useFocusEffect } from '@react-navigation/native';
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
import { turninSubmission } from "../../../../api/modules/submissionApi.ts";
import { useAlert } from '../../../../components/CAlert.tsx';
import { useActivity } from "../../../../context/SharedActivityContext.tsx";
import CButton from "../../../../components/buttons/CButton.tsx";

const InstructionScreen = ({ navigation }) => {
	const { activity } = useActivity();
	const [ActivityID, setActivityID] = useState(0);
	const [StudentActivityID, setStudentActivityID] = useState(0);
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [submissions, setSubmissions] = useState([]);
	const { showAlert } = useAlert();

	const loadSubmissions = async () => {
		if (!ActivityID || !network?.isOnline) return;

		setLoading(true);
		try {
			const res = await fetchClassAttachments(ActivityID);
			setSubmissions(res?.data || []);
		} catch (err) {
			handleApiError(err, 'Fetching attachments failed');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (activity?.ActivityID) {
			setActivityID(activity.ActivityID);
			setStudentActivityID(activity.StudentActivityID);
		}
	}, [activity]);

	useEffect(() => {
		if (ActivityID) {
			loadSubmissions();
		}
	}, [ActivityID]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadSubmissions();
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

	const renderItem = ({ item }) => {
		const isWebLink = item.Link.startsWith('http');
		return (
			<TouchableOpacity
				style={styles.submissionCard}
				onPress={() => {
					if (isWebLink) Linking.openURL(item.Link).catch(() => Alert.alert('Error', 'Failed to open link'));
					else viewFile(item.Link, item.Title);
				}}
			>
				<Icon name="document-outline" size={22} color={theme.colors.light.primary} />
				<View style={{ marginLeft: 12, flex: 1 }}>
					<CText fontSize={16} fontStyle="SB" numberOfLines={1} style={{ color: '#000' }}>{item.Title}</CText>
					{item.FileSize && <Text style={styles.subText}>Size: {getFileSize(item.FileSize)}</Text>}
				</View>
			</TouchableOpacity>
		);
	};

	const renderHeader = () => (
		<>
			<View style={styles.card}>
				{activity?.activity?.topic?.Title && (
					<CText fontSize={12} style={styles.label}>Topic: {activity?.activity?.topic?.Title}</CText>
				)}
				<CText fontSize={16} fontStyle="SB" style={styles.title}>{activity?.activity?.Title}</CText>
				<CText fontSize={12} style={styles.label}>Instruction:</CText>
				<CText style={styles.text}>{activity?.activity?.Description}</CText>
				{activity?.activity?.DueDate && (
					<>
						<CText fontSize={12} style={styles.label}>Due Date:</CText>
						<CText style={styles.text}>{formatDate(activity?.activity?.DueDate)}</CText>
					</>
				)}
				<View style={[globalStyles.cardRow, { flexDirection: 'row', justifyContent: 'flex-start' }]}>
					{activity?.activity?.Points > 0 && (
						<View style={[styles.pointsRow, { marginRight: 45 }]}>
							<CText fontSize={20} fontStyle="SB" style={{ color: theme.colors.light.primary }}>{formatNumber(activity?.activity?.Points)}</CText>
							<CText fontSize={12} style={styles.pointsLabel}>Points</CText>
						</View>
					)}
					{activity?.Grade > 0 && (
						<View style={styles.pointsRow}>
							<CText fontSize={20} fontStyle="SB" style={{ color: theme.colors.light.primary }}>{formatNumber(activity?.Grade)}</CText>
							<CText fontSize={12} style={styles.pointsLabel}>Points Earned</CText>
						</View>
					)}
				</View>
				{activity?.DateSubmitted && (
					<View style={styles.pointsRow}>
						<CText fontSize={18} fontStyle="SB" style={{ color: theme.colors.light.primary }}>{formatDate(activity?.DateSubmitted)}</CText>
						<CText fontSize={12} style={styles.pointsLabel}>Date Submitted</CText>
					</View>
				)}
			</View>

			<CText fontSize={16} style={{ marginBottom: 10 }} fontStyle="SB">Instructor</CText>
			<View style={styles.card}>
				{!activity?.activity?.teacher?.users?.name ? (
					<View style={styles.profileRow}>
						<ShimmerPlaceHolder style={styles.avatar} />
						<View style={styles.profileInfo}>
							<ShimmerPlaceHolder style={{ width: 150, marginBottom: 10, borderRadius: 6 }} />
							<ShimmerPlaceHolder style={{ width: 100, borderRadius: 6 }} />
						</View>
					</View>
				) : (
					<View style={styles.profileRow}>
						<Image
							source={{ uri: activity?.activity?.teacher?.users?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity?.activity?.teacher?.users?.name || 'User')}` }}
							style={styles.avatar}
						/>
						<View style={styles.profileInfo}>
							<CText fontSize={17} fontStyle="SB">{activity?.activity?.teacher?.users?.name}</CText>
							<CText fontSize={12} style={{ color: '#777' }}>{activity?.activity?.teacher?.users?.email}</CText>
						</View>
					</View>
				)}
			</View>

			<CText fontSize={16} style={{ marginBottom: 10 }} fontStyle="SB">Attachments</CText>
			{activity?.activity?.QuizID > 0 && (
				<View>
					<CButton
						title="Take Quiz"
						type={'success'}
						style={{ padding: 12, borderRadius: 5, width: '100%' }}
						onPress={() => navigation.navigate("QuizStartScreen", { SurveyID: activity?.activity?.QuizID, Duration: activity?.activity?.Duration, ActivityID: activity?.activity?.ActivityID })}
					/>
				</View>
			)}
		</>
	);

	const renderShimmer = () =>
		[1, 2].map((_, index) => (
			<View style={{ padding: 16 }} key={index}>
				<ShimmerPlaceHolder
					loading={true}
					LinearGradient={LinearGradient}
					style={{ width: '100%', height: 100, borderRadius: 6 }}
					autoRun
				/>
			</View>
		));

	return (
		<>
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
						>
							<Icon
								name={
									activity?.SubmissionType === 'Submitted'
										? 'close-outline'
										: 'checkmark-circle'
								}
								size={18}
								color="#fff"
							/>
							<CText fontStyle={'SB'} fontSize={14} style={{ color: '#fff', marginLeft: 4 }}>
								{activity?.SubmissionType === 'Submitted' ? 'Withdraw' : 'Turn in'}
							</CText>
						</TouchableOpacity>
					)
				}
			/>

			<SafeAreaView style={globalStyles.safeArea}>
				{loading ? renderShimmer() : (
					<FlatList
						data={submissions}
						keyExtractor={(item, i) => `${item.id}-${i}`}
						ListHeaderComponent={renderHeader}
						renderItem={renderItem}
						contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						ListEmptyComponent={<Text style={styles.emptyText}>No attachments. 💤</Text>}
					/>
				)}
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	submitBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderRadius: 6,
		backgroundColor: theme.colors.light.primary,
	},
	submissionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
		marginBottom: 10,
		backgroundColor: '#fff',
		borderRadius: 6,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
	},
	subText: { fontSize: 12, color: '#777' },
	card: {
		backgroundColor: 'rgba(255,255,255,0.95)',
		borderRadius: 6,
		padding: 16,
		marginBottom: 16,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 1 },
	},
	title: { color: theme.colors.light.primary, marginBottom: 8 },
	label: { color: '#888', marginTop: 12, marginBottom: 4, letterSpacing: 0.5 },
	text: { fontSize: 14, color: '#000', lineHeight: 20 },
	pointsRow: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' },
	pointsLabel: { color: '#666', marginTop: 4 },
	emptyText: { textAlign: 'center', paddingVertical: 20, color: '#aaa', fontSize: 13 },
	profileRow: { flexDirection: 'row', alignItems: 'center' },
	profileInfo: { marginLeft: 10, flex: 1 },
	avatar: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#ccc' },
});

export default InstructionScreen;
