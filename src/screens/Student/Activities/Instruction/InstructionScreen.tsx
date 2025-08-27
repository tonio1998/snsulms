import React, { useContext, useEffect, useState } from "react";
import {
	View,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView,
	Image,
	StyleSheet,
	ActivityIndicator,
	Linking,
	Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../../../context/AuthContext.tsx";
import { NetworkContext } from "../../../../context/NetworkContext.tsx";
import { useLoading } from "../../../../context/LoadingContext.tsx";
import { globalStyles } from "../../../../theme/styles.ts";
import { theme } from "../../../../theme";
import BackHeader from "../../../../components/layout/BackHeader.tsx";
import { CText } from "../../../../components/common/CText.tsx";
import { formatDate } from "../../../../utils/dateFormatter";
import { handleApiError } from "../../../../utils/errorHandler.ts";
import { getFileSize, formatNumber } from "../../../../utils/format.ts";
import { viewFile } from "../../../../utils/viewFile.ts";
import { turninSubmission } from "../../../../api/modules/submissionApi.ts";
import { useAlert } from "../../../../components/CAlert.tsx";
import { useStudActivity } from "../../../../context/StudSharedActivityContext.tsx";
import CButton from "../../../../components/buttons/CButton.tsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActivityIndicator2 from "../../../../components/loaders/ActivityIndicator2.tsx";

const InstructionScreen = ({ navigation }) => {
	const { activity, refreshFromOnline } = useStudActivity();
	const ActivityID = activity?.ActivityID;
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const { showLoading, hideLoading } = useLoading();
	const { showAlert } = useAlert();

	const [submissions, setSubmissions] = useState([]);
	const [submissionState, setSubmissionState] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const SUBMISSION_KEY = `submission_${ActivityID}_${user?.id}`;

	const loadSubmissions = async () => {
		setLoading(true);
		try {
			const res = activity?.files || [];
			setSubmissions(res);
			const savedState =
				(await AsyncStorage.getItem(SUBMISSION_KEY)) || "Not Submitted";
			setSubmissionState(savedState);
		} catch (err) {
			await refreshFromOnline();
			handleApiError(err, "Fetch submissions");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSubmissions();
	}, [ActivityID]);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await refreshFromOnline();
			const newState =
				activity?.mysubmission?.SubmissionType === "Submitted"
					? "Submitted"
					: "";

			await AsyncStorage.setItem(SUBMISSION_KEY, newState);
			setSubmissionState(newState);
			await loadSubmissions();
		} catch (err) {
			handleApiError(err, "Refresh failed");
		} finally {
			setRefreshing(false);
		}
	};

	const handleAction = async () => {
		try {
			const isSubmitted = submissionState === "Submitted";
			showLoading(isSubmitted ? "Withdrawing..." : "Submitting...");
			const res = await turninSubmission({ActivityID});

			if (res) {
				const newState = isSubmitted ? "Not Submitted" : "Submitted";
				await AsyncStorage.setItem(SUBMISSION_KEY, newState);
				setSubmissionState(newState);
				showAlert(
					"success",
					isSubmitted ? "Withdrawn" : "Submitted",
					isSubmitted
						? "Submission has been withdrawn."
						: "Submitted successfully."
				);
				// navigation.goBack();
			} else {
				showAlert("error", "Error", res.message || "Something went wrong");
			}
		} catch (e) {
			handleApiError(e, "Submission failed");
		} finally {
			hideLoading();
		}
	};

	const handleConfirmAction = () => {
		const isSubmitted = submissionState === "Submitted";
		Alert.alert(
			isSubmitted ? "Withdraw Submission?" : "Submit?",
			isSubmitted
				? "Are you sure you want to withdraw your submission?"
				: "Are you sure you want to submit?",
			[
				{ text: "Cancel", style: "cancel" },
				{ text: isSubmitted ? "Withdraw" : "Submit", onPress: handleAction },
			]
		);
	};

	const openAttachment = (item) => {
		const isWebLink = item.Link.startsWith("http");
		if (isWebLink) {
			Linking.openURL(item.Link).catch(() =>
				Alert.alert("Error", "Failed to open link")
			);
		} else {
			viewFile(item.Link, item.Title);
		}
	};

	return (
		<SafeAreaView style={[globalStyles.safeArea]}>
			<BackHeader
				title="Instruction"
				rightButton={
					<TouchableOpacity
						style={[
							globalStyles.button,
							{
								backgroundColor:
									submissionState === "Submitted"
										? theme.colors.light.danger
										: theme.colors.light.primary,
							},
						]}
						onPress={handleConfirmAction}
						activeOpacity={0.7}
					>
						<CText
							fontStyle="SB"
							fontSize={14}
							style={{ color: "#fff", marginLeft: 6 }}
						>
							{submissionState === "Submitted" ? "Withdraw" : "Turn In"}
						</CText>
					</TouchableOpacity>
				}
			/>

			<ScrollView
				contentContainerStyle={{ padding: 10, paddingBottom: 40 }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			>
				{loading && <ActivityIndicator2 />}

				<View style={[globalStyles.card, { marginHorizontal: 0 }]}>
					{activity?.topic?.Title && (
						<CText fontSize={theme.fontSizes.xs} style={styles.topicLabel}>
							Topic: {activity.topic.Title}
						</CText>
					)}
					<CText fontSize={theme.fontSizes.md} fontStyle="SB" style={styles.title}>
						{activity?.Title}
					</CText>

					{activity?.ActivityTypeID > 1 && (
						<>
							{activity?.Description && (
								<>
									<CText fontSize={theme.fontSizes.xs} style={styles.sectionLabel}>
										Instruction:
									</CText>
									<CText style={styles.description} fontStyle="SB">
										{activity.Description}
									</CText>
								</>
							)}

							{activity?.DueDate && (
								<>
									<CText fontSize={theme.fontSizes.xs} style={styles.sectionLabel}>
										Due Date:
									</CText>
									<CText style={styles.description} fontStyle="SB">
										{formatDate(activity.DueDate)}
									</CText>
								</>
							)}

							{activity?.DateSubmitted && (
								<>
									<CText fontSize={theme.fontSizes.xs} style={styles.sectionLabel}>
										Date Submitted
									</CText>
									<CText style={styles.description} fontStyle="SB">
										{formatDate(activity.DateSubmitted)}
									</CText>
								</>
							)}

							<View style={styles.pointsContainer}>
								{activity?.Points > 0 && (
									<View style={styles.pointsBox}>
										<CText
											fontSize={theme.fontSizes.xl}
											fontStyle="B"
											style={{ color: theme.colors.light.primary }}
										>
											{formatNumber(activity.Points)}
										</CText>
										<CText fontSize={theme.fontSizes.xs} style={styles.pointsLabel}>
											Points
										</CText>
									</View>
								)}
								{activity?.Grade > 0 && (
									<View style={styles.pointsBox}>
										<CText
											fontSize={theme.fontSizes.xl}
											fontStyle="B"
											style={{ color: theme.colors.light.primary }}
										>
											{formatNumber(activity.Grade)}
										</CText>
										<CText fontSize={theme.fontSizes.xs} style={styles.pointsLabel}>
											Points Earned
										</CText>
									</View>
								)}
							</View>
						</>
					)}
				</View>

				{/* Instructor */}
				<CText fontSize={16} fontStyle="SB" style={{ marginBottom: 12 }}>
					Instructor
				</CText>
				<View style={[globalStyles.card, { marginHorizontal: 0 }]}>
					{!activity?.teacher?.users?.name ? (
						<View style={styles.profileRow}>
							<View style={[styles.avatar, styles.avatarPlaceholder]} />
							<View style={{ marginLeft: 14, flex: 1 }}>
								<View
									style={[
										styles.shimmerPlaceholder,
										{ width: 160, height: 18, marginBottom: 8 },
									]}
								/>
								<View
									style={[styles.shimmerPlaceholder, { width: 120, height: 14 }]}
								/>
							</View>
						</View>
					) : (
						<View style={styles.profileRow}>
							<Image
								source={{
									uri:
										activity?.teacher.users.avatar ||
										`https://ui-avatars.com/api/?name=${encodeURIComponent(
											activity?.teacher.users.name || "User"
										)}`,
								}}
								style={styles.avatar}
							/>
							<View style={{ marginLeft: 14, flex: 1 }}>
								<CText fontSize={17} fontStyle="SB" style={{ color: "#222" }}>
									{activity?.teacher.users.name}
								</CText>
								<CText fontSize={14} style={{ color: "#555", marginTop: 2 }}>
									{activity?.teacher.users.email}
								</CText>
							</View>
						</View>
					)}
				</View>

				{/* Attachments */}
				<CText
					fontSize={16}
					fontStyle="SB"
					style={{ marginBottom: 12, marginTop: 8 }}
				>
					Attachments
				</CText>

				{activity?.QuizID > 0 && (
					<View style={{ marginBottom: 16 }}>
						<CButton
							type={"success"}
							title="Go to Quiz"
							style={{ padding: 12 }}
							onPress={() =>
								navigation.navigate("QuizScreen", { QuizID: activity.QuizID })
							}
						/>
					</View>
				)}

				{submissions.map((item) => (
					<TouchableOpacity
						key={item?.UploadID}
						style={styles.attachmentRow}
						activeOpacity={0.7}
						onPress={() => openAttachment(item)}
					>
						<Icon
							name="document-outline"
							size={22}
							color={theme.colors.light.primary}
						/>
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
				))}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	topicLabel: { color: "#666", marginBottom: 6 },
	title: { color: "#222", marginBottom: 10 },
	sectionLabel: {
		color: "#444",
		marginTop: 12,
		marginBottom: 6,
		fontWeight: "600",
	},
	description: { color: "#444", lineHeight: 20 },
	pointsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 20,
	},
	pointsBox: { alignItems: "center" },
	pointsLabel: { color: "#666" },
	profileRow: { flexDirection: "row", alignItems: "center" },
	avatar: { width: 45, height: 45, borderRadius: 28, backgroundColor: "#ddd" },
	avatarPlaceholder: { backgroundColor: "#ccc" },
	shimmerPlaceholder: { backgroundColor: "#eee", borderRadius: 8 },
	attachmentRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: "#fafafa",
		borderRadius: 8,
		marginBottom: 12,
		shadowColor: theme.colors.light.primary,
		shadowOpacity: 1,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		borderWidth: 1,
		borderColor: "#e1e1e1",
	},
	attachmentInfo: { flex: 1, marginLeft: 12 },
	attachmentTitle: { color: "#222", fontWeight: "600", fontSize: 15 },
	attachmentDetails: { color: "#777", marginTop: 2, fontSize: 13 },
});

export default InstructionScreen;
