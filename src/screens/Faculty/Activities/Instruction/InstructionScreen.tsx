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
import { fetchClassAttachments, getStudenActivityDetails } from '../../../../api/modules/activitiesApi.ts';
import { getFileSize, formatNumber } from '../../../../utils/format.ts';
import { getOfflineActivityById, saveActivitiesOffline } from '../../../../utils/sqlite/offlineActivityService.ts';
import { viewFile } from '../../../../utils/viewFile.ts';
import {turninSubmission} from "../../../../api/modules/submissionApi.ts";
import { useAlert } from '../../../../components/CAlert.tsx';
import {useFacActivity} from "../../../../context/FacSharedActivityContext.tsx";

const InstructionScreen = ({ navigation, route }) => {
	const { activity } = useFacActivity();
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingSubmissions, setLoadingSubmissions] = useState(false);
	const [submissions, setSubmissions] = useState([]);
	const {showAlert} = useAlert();
	const [ActivityID, setActivityID] = useState();

	const loadSubmissions = async () => {
		setLoading(true)
		// showLoading('Loading submissions...');
		try {
			setLoadingSubmissions(true);
			const res = await fetchClassAttachments(ActivityID);
			setSubmissions(res.data);
		} catch (err) {
			handleApiError(err, 'Fetch');
		} finally {
			setLoadingSubmissions(false);
			setLoading(false);
			// hideLoading();
		}
	};

	useEffect(() => {
		if (activity?.ActivityID > 0) {
			setActivityID(activity.ActivityID);
		}
	}, [activity]);

	useEffect(() => {
		if (ActivityID > 0) {
			loadSubmissions();
		}
	}, [ActivityID]);



	const handleRefresh = async () => {
		setRefreshing(true);
		loadSubmissions();
		setRefreshing(false);
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
				{activity?.topic?.Title && (
					<CText fontSize={12} style={styles.label}>Topic: {activity?.topic?.Title}</CText>
				)}
				<CText fontSize={16} fontStyle="SB" style={styles.title}>{activity?.Title}</CText>
				<CText fontSize={12} style={styles.label}>Instruction:</CText>
				<CText style={styles.text}>{activity?.Description}</CText>
				{activity?.DueDate && <>
					<CText fontSize={12} style={styles.label}>Due Date:</CText>
					<CText style={styles.text}>{formatDate(activity?.DueDate)}</CText>
				</>}

				<View style={[globalStyles.cardRow, {flexDirection: 'row', justifyContent: 'flex-start'}]}>
					{activity?.Points > 0 && (
						<View style={[styles.pointsRow, {marginRight: 45}]}>
							<CText fontSize={20} fontStyle="SB" style={{ color: theme.colors.light.primary, textAlign: 'center' }}>{formatNumber(activity?.Points)}</CText>
							<CText fontSize={12} style={styles.pointsLabel}>Points</CText>
						</View>
					)}
					{activity?.Grade > 0 && (
						<View style={styles.pointsRow}>
							<CText fontSize={20} fontStyle="SB" style={{ color: theme.colors.light.primary, textAlign: 'center' }}>{formatNumber(activity?.Grade)}</CText>
							<CText fontSize={12} style={styles.pointsLabel}>Points Earned</CText>
						</View>
					)}
				</View>

				<View style={[globalStyles.cardRow, {flexDirection: 'row', justifyContent: 'flex-start'}]}>
					{activity?.DateSubmitted && (
						<View style={styles.pointsRow}>
							<CText fontSize={18} fontStyle="SB" style={{ color: theme.colors.light.primary, textAlign: 'center' }}>{formatDate(activity?.DateSubmitted)}</CText>
							<CText fontSize={12} style={styles.pointsLabel}>Date Submitted</CText>
						</View>
					)}
				</View>
			</View>

			<CText fontSize={16} style={{ marginBottom: 10}} fontStyle="SB">Instructor</CText>
			<View style={styles.card}>
				{!activity?.teacher?.users?.name ? (
					<>

						<View style={styles.profileRow}>
							<ShimmerPlaceHolder style={styles.avatar}/>
							<View style={styles.profileInfo}>
								<ShimmerPlaceHolder style={{
									width: 150,
									marginBottom: 10
								}}/>
								<ShimmerPlaceHolder style={{
									width: 100
								}}/>
							</View>
						</View>
					</>
				) : (
					<>
						<View style={styles.profileRow}>
							<Image
								source={{ uri: activity?.teacher?.users?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity?.teacher?.users?.name || 'User')}` }}
								style={styles.avatar}
							/>
							<View style={styles.profileInfo}>
								<CText fontSize={17} fontStyle="SB">{activity?.teacher?.users?.name || ''}</CText>
								<CText fontSize={12} style={{ color: '#777' }}>{activity?.teacher?.users?.email}</CText>
							</View>
						</View>
					</>
				)}
			</View>

			<CText fontSize={16} style={{ marginBottom: 10}} fontStyle="SB">Attachments</CText>
		</>
	);

	const renderShimmer = () => (
		[1, 2].map((_, index) => (
			<View style={{ padding: 16}} key={index}>
				<ShimmerPlaceHolder
					loading={true}
					LinearGradient={LinearGradient}
					style={{ width: '100%', height: 100, borderRadius: 12, }}
					autoRun
				/>
			</View>
		))
	);

	return (
		<>
			<BackHeader
				title="Instruction"/>

			<SafeAreaView style={globalStyles.safeArea}>
				<FlatList
					data={submissions}
					keyExtractor={(item, i) => `${item.id}-${i}`}
					ListHeaderComponent={renderHeader}
					renderItem={renderItem}
					contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					ListEmptyComponent={<Text style={styles.emptyText}>No attachments. 💤</Text>}
				/>
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
		borderRadius: 12,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
	},
	subText: { fontSize: 12, color: '#777' },
	card: {
		backgroundColor: 'rgba(255,255,255,0.95)',
		borderRadius: 16,
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
	avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },
});

export default InstructionScreen;
