import React, { useCallback, useContext, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, Image, StyleSheet } from 'react-native';
import { useAuth } from '../../../../context/AuthContext.tsx';
import { NetworkContext } from '../../../../context/NetworkContext.tsx';
import { globalStyles } from '../../../../theme/styles.ts';
import { theme } from '../../../../theme';
import BackHeader from '../../../../components/layout/BackHeader.tsx';
import { CText } from '../../../../components/common/CText.tsx';
import { handleApiError } from '../../../../utils/errorHandler.ts';
import { getActivityResponses } from '../../../../api/modules/submissionApi.ts';
import { useFacActivity } from '../../../../context/FacSharedActivityContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ShimmerList } from '../../../../components/loaders/ShimmerList.tsx';
import { LastUpdatedBadge } from "../../../../components/common/LastUpdatedBadge";
import {
	loadActivitySubmissionToLocal,
	saveActivitySubmissionToLocal
} from "../../../../utils/cache/Faculty/localActivitySubmission";
import ActivityIndicator2 from "../../../../components/loaders/ActivityIndicator2.tsx";

const SubmissionListScreen = ({ navigation }) => {
	const { activity } = useFacActivity();
	const network = useContext(NetworkContext);
	const { user } = useAuth();

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [submissions, setSubmissions] = useState([]);
	const [lastFetched, setLastFetched] = useState(null);

	const loadSubmissions = async (id) => {
		if (!id || id <= 0) return;
		setLoading(true);
		try {
			const { data, date } = await loadActivitySubmissionToLocal(id);
			if (data) {
				setSubmissions(data);
				setLastFetched(date);
				setLoading(false);
				console.log('🔍 Fetching submissions from local cache', data);
			}

			if (!data) {
				const res = await getActivityResponses({ ActivityID: id });
				console.log('🔍 Fetching submissions from API', res);
				setSubmissions(res.data);
				const savedTime = await saveActivitySubmissionToLocal(id, res.data);
				if (savedTime) setLastFetched(savedTime);
			}
		} catch (error) {
			handleApiError(error, "Failed to fetch submissions");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		if (!activity?.ActivityID) return;
		setLoading(true);
		try {
			const res = await getActivityResponses({ ActivityID: activity.ActivityID });
			console.log(res.data)
			setSubmissions(res.data);
			const savedTime = await saveActivitySubmissionToLocal(activity.ActivityID, res.data);
			if (savedTime) setLastFetched(savedTime);
		} catch (error) {
			handleApiError(error, "Failed to refresh submissions");
		} finally {
			setLoading(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			if (activity?.ActivityID && activity.ActivityID > 0) {
				loadSubmissions(activity.ActivityID);
			}
		}, [activity?.ActivityID])
	);


	const handleViewSubmission = (StudentActivityID, ActivityID) => {
		navigation.navigate('SubmissionDetails', {
			StudentActivityID,
			ActivityID
		});
	};

	const renderSubmission = ({ item }) => {
		const student = item.student_info || {};
		const userInfo = student.user || {};
		const grade = item.Grade;
		const isSubmitted = item.SubmissionType === 'Submitted';

		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => handleViewSubmission(item.StudentActivityID, item.ActivityID)}
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
					<View style={styles.statusBox}>
						<Icon
							name={isSubmitted ? 'checkmark-circle' : 'checkmark-circle-outline'}
							size={22}
							color={isSubmitted ? theme.colors.light.primary : '#ccc'}
						/>
						<CText fontSize={13}>{isSubmitted ? 'Turned in' : 'Not submitted'}</CText>
					</View>
					{typeof grade === 'number' && (
						<View style={styles.statusBox}>
							<CText fontSize={13}>Points</CText>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
								<Icon name="star" size={20} color={theme.colors.light.warning} />
								<CText fontSize={18} fontStyle="SB">
									{grade}/{item.activity?.Points}
								</CText>
							</View>
						</View>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<>
			<BackHeader title="Submissions" />
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 90}]}>
				<View style={{paddingHorizontal: 16}}>
					<LastUpdatedBadge
						date={lastFetched}
						onReload={onRefresh}
					/>
				</View>
				{loading && (
					<>
						<ActivityIndicator2 />
					</>
				)}
				<ShimmerList
					data={submissions}
					// loading={loading}
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
});

export default SubmissionListScreen;
