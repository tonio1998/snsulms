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

const InstructionScreen = ({ navigation, route }) => {
	const StudentActivityID = route.params.StudentActivityID;
	const network = useContext(NetworkContext);
	const { user } = useAuth();
	const [activity, setActivity] = useState([]);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();

	const fetch = async (pageNumber = 1, filters = {}) => {
		try {
			if (loading) return;
			setLoading(true);
			showLoading("Loading...")

			if (network?.isOnline) {
				const res = await getStudenActivityDetails(StudentActivityID);
				setActivity(res)
			} else {
			}
		} catch (error) {
			handleApiError(error, "Failed to load students");
		} finally {
			setLoading(false);
			hideLoading()
		}
	};

	useEffect(() => {
		fetch(1);
	}, []);

	useEffect(() => {
		const unsub = navigation.addListener('focus', () => {
			navigation.getParent()?.setOptions({ title: 'Instruction' });
		});
		return unsub;
	}, [navigation]);




	useFocusEffect(
		useCallback(() => {
			fetch(1);
		}, [])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetch(1);
		setRefreshing(false);
	};

	return (
		<>
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 0}]}>
				<View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
					<ScrollView contentContainerStyle={{ paddingBottom: 100, borderTopLeftRadius: 20, borderTopRightRadius: 20 }} refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}>
						{loading ? (
							<>
								<ShimmerPlaceHolder loading={true} CText={CText}
									LinearGradient={LinearGradient}
									style={{ width: '100%', height: 100, borderRadius: 10, marginTop: 10 }}
									shimmerStyle={{ borderRadius: 4 }}
									autoRun
								/>
								<ShimmerPlaceHolder loading={true} CText={CText}
													LinearGradient={LinearGradient}
													style={{ width: '100%', height: 100, borderRadius: 10, marginTop: 10 }}
													shimmerStyle={{ borderRadius: 4 }}
													autoRun
								/>
							))
							</>
						) : (
							<>
								<View style={[styles.card, { padding: 16}]}>
									<CText fontSize={14} style={{ color: '#000', marginTop: 6 }}>
										Topic: { activity?.activity?.topic?.Title }
									</CText>
									<CText fontSize={16} fontStyle={'SB'} style={{ color: '#000' }}>{ activity?.activity?.Title }</CText>
									<CText style={{ color: '#6F6F6F', marginTop: 10 }}>{'Instruction:'}</CText>
									<CText fontSize={14} style={{ color: '#000', }}>{ activity?.activity?.Description }</CText>

									{activity?.activity?.DueDate && (
										<>
											<CText style={{ color: '#6F6F6F', marginTop: 10 }}>{'Due Date:'}</CText>
											<CText fontSize={14} style={{ color: '#000'}}>
												{ formatDate(activity?.activity?.DueDate) }
											</CText>
										</>
									)}
									<View style={{ borderTopWidth: 1, borderColor: '#ccc', marginTop: 10 }}>
										<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
											{activity?.activity?.Points > 0 && (
												<View>
													<CText fontSize={16} fontStyle={'SB'} style={{  marginTop: 6 }}>
														{formatNumber(activity?.activity?.Points)}
													</CText>
													<CText fontSize={14} style={{ color: '#999', marginTop: 0 }}>
														Points
													</CText>
												</View>
											)}
										</View>
									</View>
								</View>
								<View style={[styles.card,{ padding: 16}]}>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
										<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
											<Image
												source={
													activity?.activity?.teacher?.users?.avatar
														? { uri: activity?.activity?.teacher?.users?.avatar }
														: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
																activity?.activity?.teacher?.users?.name || 'User'
															)}&background=random`
														}
												}
												style={styles.avatar}
											/>
											<View>
												<CText
													fontSize={14}
													fontStyle={'SB'}
													style={[globalStyles.textUppercase, { color: '#000', marginLeft: 10 ,width: '100%' }]}
												>
													{(activity?.activity?.teacher?.Title || '') + ' ' + (activity?.activity?.teacher?.users?.name || '')}
												</CText>

												<CText fontSize={12} style={{ color: '#000', marginLeft: 10, marginTop: -0 }}>{ activity?.activity?.teacher?.users?.email}</CText>
											</View>
										</View>
									</View>
								</View>
							</>
						)}
					</ScrollView>
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.light.card,
		// padding: 16,
		borderRadius: 8,
		marginBottom: 10,
	},
	avatar: {
		width: 35,
		height: 35,
		borderRadius: 60,
		// borderWidth: 2,
		borderColor: theme.colors.light.primary,
	},
	floatBtn: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
	fab: {
		backgroundColor: theme.colors.light.primary,
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	}
});

export default InstructionScreen;
