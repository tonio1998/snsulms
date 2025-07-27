import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	FlatList,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	SafeAreaView, Image, ScrollView, StyleSheet, Animated, Easing
} from 'react-native';
import {NetworkContext} from "../../../context/NetworkContext.tsx";
import CustomHeader from "../../../components/CustomHeader.tsx";
import BackgroundWrapper from "../../../utils/BackgroundWrapper";
import {globalStyles} from "../../../theme/styles.ts";
import {theme} from "../../../theme";
import {CText} from "../../../components/CText.tsx";
import {handleApiError} from "../../../utils/errorHandler.ts";
import {getWall, reactPost} from "../../../api/modules/wallApi.ts";
import Icon from "react-native-vector-icons/Ionicons";
import {FILE_BASE_URL} from "../../../api/api_configuration.ts";
import {useAuth} from "../../../context/AuthContext.tsx";
import CButton from "../../../components/CButton.tsx";
import {formatDate} from "../../../utils/dateFormatter";
import {useFocusEffect} from "@react-navigation/native";
import {useLoading} from "../../../context/LoadingContext.tsx";
import {getStudenActivityDetails} from "../../../api/modules/activitiesApi.ts";
import {formatNumber} from "../../../utils/format.ts";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import BackHeader from "../../../components/BackHeader.tsx";
import {getOfflineActivities, getOfflineActivityById} from "../../../utils/sqlite/offlineActivityService.ts";

const InstructionScreen = ({ navigation, route }) => {
	const StudentActivityID = route.params.StudentActivityID;
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const [activity, setActivity] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();

	const fetch = async () => {
		try {
			if (loading) return;
			setLoading(true);
			showLoading("Loading...");

			if (network?.isOnline) {
				const res = await getStudenActivityDetails(StudentActivityID);
				setActivity(res);
			} else {
				const local = await getOfflineActivityById(StudentActivityID);
				if (local) {
					setActivity(local);
					console.log("Loaded from offline:", local);
				} else {
					console.warn("No offline data found for StudentActivityID:", StudentActivityID);
				}
			}
		} catch (error) {
			handleApiError(error, "Failed to load students");
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useEffect(() => {
		fetch();
	}, []);

	useFocusEffect(useCallback(() => { fetch(); }, []));

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetch();
		setRefreshing(false);
	};

	const renderShimmer = () => (
		<>
			{[1, 2].map((_, index) => (
				<ShimmerPlaceHolder
					key={index}
					loading={true}
					CText={CText}
					LinearGradient={LinearGradient}
					style={{ width: '100%', height: 100, borderRadius: 12, marginVertical: 10 }}
					shimmerStyle={{ borderRadius: 12 }}
					autoRun
				/>
			))}
		</>
	);

	const renderContent = () => (
		<>
			<View style={styles.card}>
				<CText fontSize={14} style={styles.label}>Topic:</CText>
				<CText fontSize={16} fontStyle="SB" style={styles.title}>
					{activity?.activity?.topic?.Title}
				</CText>

				<CText fontSize={14} style={styles.label}>Instruction:</CText>
				<CText style={styles.text}>{activity?.activity?.Description}</CText>

				{activity?.activity?.DueDate && (
					<>
						<CText fontSize={14} style={styles.label}>Due Date:</CText>
						<CText style={styles.text}>{formatDate(activity?.activity?.DueDate)}</CText>
					</>
				)}

				{activity?.activity?.Points > 0 && (
					<View style={styles.pointsRow}>
						<CText fontSize={18} fontStyle="SB">{formatNumber(activity?.activity?.Points)}</CText>
						<CText fontSize={13} style={styles.pointsLabel}>Points</CText>
					</View>
				)}
			</View>

			<View style={styles.card}>
				<View style={styles.profileRow}>
					<Image
						source={
							activity?.activity?.teacher?.users?.avatar
								? { uri: activity?.activity?.teacher?.users?.avatar }
								: {
									uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
										activity?.activity?.teacher?.users?.name || 'User'
									)}&background=random`
								}
						}
						style={styles.avatar}
					/>
					<View style={styles.profileInfo}>
						<CText fontSize={14} fontStyle="SB" style={globalStyles.textUppercase}>
							{(activity?.activity?.teacher?.Title || '') + ' ' + (activity?.activity?.teacher?.users?.name || '')}
						</CText>
						<CText fontSize={12} style={{ color: '#555' }}>
							{activity?.activity?.teacher?.users?.email}
						</CText>
					</View>
				</View>
			</View>
		</>
	);

	return (
		<>
			<BackHeader title="Instruction" />
			<BackgroundWrapper>
				<SafeAreaView style={globalStyles.safeArea}>
					<View style={{ flex: 1, padding: 12 }}>
						<ScrollView
							contentContainerStyle={{ paddingBottom: 100 }}
							refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						>
							{loading ? renderShimmer() : renderContent()}
						</ScrollView>
					</View>
				</SafeAreaView>
			</BackgroundWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.light.card,
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	title: {
		color: '#000',
		marginBottom: 8,
	},
	label: {
		color: '#6F6F6F',
		marginTop: 10,
		marginBottom: 4,
	},
	text: {
		color: '#000',
		fontSize: 14,
		lineHeight: 20,
	},
	pointsRow: {
		marginTop: 14,
		borderTopWidth: 1,
		borderColor: '#eee',
		paddingTop: 10,
	},
	pointsLabel: {
		color: '#888',
		marginTop: 2,
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	profileInfo: {
		marginLeft: 10,
		flex: 1,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#ccc',
	},
});

export default InstructionScreen;