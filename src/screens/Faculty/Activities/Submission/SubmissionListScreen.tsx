import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Image,
	StyleSheet, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../../../context/AuthContext.tsx';
import { NetworkContext } from '../../../../context/NetworkContext.tsx';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import BackHeader from '../../../../components/layout/BackHeader.tsx';
import { CText } from '../../../../components/common/CText.tsx';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { getActivityResponses } from '../../../../api/modules/submissionApi.ts';
import { useActivity } from "../../../../context/SharedActivityContext.tsx";
import Icon from "react-native-vector-icons/Ionicons";
import {useFacActivity} from "../../../../context/FacSharedActivityContext.tsx";
import {useFocusEffect} from "@react-navigation/native";
import {ShimmerList} from "../../../../components/loaders/ShimmerList.tsx";

const SubmissionListScreen = ({ navigation }) => {
	const { activity } = useFacActivity();
	const network = useContext(NetworkContext);
	const { user } = useAuth();

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [submissions, setSubmissions] = useState([]);
	const [ActivityID, setActivityID] = useState(0);

	const loadSubmissions = async (id) => {
		if (!id || id <= 0) return;

		setLoading(true);
		try {
			const data = await getActivityResponses({ ActivityID: id });
			setSubmissions(data.data);
		} catch (error) {
			handleApiError(error, "Failed to fetch submissions");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadSubmissions(ActivityID);
		setRefreshing(false);
	};

	useEffect(() => {
		if (activity?.ActivityID > 0) {
			setActivityID(activity.ActivityID);
		}
	}, [activity]);

	useFocusEffect(
		useCallback(() => {
			if (ActivityID > 0) {
				loadSubmissions(ActivityID);
			}
		}, [ActivityID])
	);


	const handleViewSubmission = (StudentActivityID) => {
		navigation.navigate('SubmissionDetails', { StudentActivityID });
	};

	const renderSubmission = ({ item }) => {
		const student = item.student_info || {};
		const userInfo = student.user || {};
		const grade = item.Grade;
		const isSubmitted = item.SubmissionType === 'Submitted';
		const isReviewed = item.reviewed;

		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => handleViewSubmission(item.StudentActivityID)}
			>
				<View style={styles.submissionCard}>
					<Image
						source={
							userInfo.profile_pic
								? { uri: userInfo.profile_pic }
								: userInfo.avatar
									? { uri: userInfo.avatar }
									: {
										uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
											userInfo.name || 'User'
										)}&background=random`,
									}
						}
						style={styles.avatar}
					/>
					<View style={styles.profileInfo}>
						<CText style={styles.nameText}>
							{student.FirstName} {student.LastName}
						</CText>
						<CText style={styles.subText}>{userInfo.email}</CText>
					</View>
				</View>

				<View style={styles.detailsRow}>
					<View>
						{isSubmitted && (
							<View style={styles.statusBox}>
								<CText fontSize={13}>Submitted</CText>
								<Icon
									name={isSubmitted ? "checkmark-circle" : "close-circle"}
									size={22}
									color={isSubmitted ? theme.colors.light.primary : theme.colors.light.danger}
								/>
							</View>
						)}
					</View>
					<View>
						{typeof grade === 'number' && (
							<View style={styles.statusBox}>
								<CText fontSize={13}>Points</CText>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
									<Icon
										name="star"
										size={20}
										color={theme.colors.light.warning}
									/>
									<CText fontSize={18} fontStyle="SB">
										{grade}/{item.activity?.Points}
									</CText>
								</View>
							</View>
						)}
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<>
			<BackHeader title="Submissions" />
			<SafeAreaView style={globalStyles.safeArea}>
				<ShimmerList
					data={submissions}
					loading={loading}
					keyExtractor={(item) => item.StudentActivityID.toString()}
					renderItem={renderSubmission}
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 14,
		marginHorizontal: 12,
		marginBottom: 8,
		elevation: 1,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	submissionCard: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	profileInfo: {
		marginLeft: 10,
		flex: 1,
	},
	nameText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
	},
	subText: {
		fontSize: 12,
		color: '#6b7280',
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#d1d5db',
	},
	detailsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 12,
	},
	statusBox: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	emptyText: {
		textAlign: 'center',
		paddingVertical: 24,
		color: '#9ca3af',
		fontSize: 13,
	},
});


export default SubmissionListScreen;
