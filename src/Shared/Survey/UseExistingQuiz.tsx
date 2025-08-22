import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
	View,
	TextInput,
	TouchableOpacity,
	SafeAreaView,
	StyleSheet,
	Dimensions,
	Modal,
	Animated,
	Easing,
	FlatList, Text,
} from 'react-native';
import CustomHeader from "../../components/layout/CustomHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import Icon from "react-native-vector-icons/Ionicons";
import { CText } from "../../components/common/CText.tsx";
import { theme } from "../../theme";
import { useLoading } from "../../context/LoadingContext.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { ShimmerList } from "../../components/loaders/ShimmerList.tsx";
import { formatDate } from "../../utils/dateFormatter";
import { useAuth } from "../../context/AuthContext.tsx";
import {getTestBuilderData} from "../../api/testBuilder/testbuilderApi.ts";
import BackHeader from "../../components/layout/BackHeader.tsx";
import {loadSurveyToLocal, saveSurveyToLocal} from "../../utils/cache/Survey/localSurvey";
import ActivityIndicator2 from "../../components/loaders/ActivityIndicator2.tsx";

const { height } = Dimensions.get('window');

const UseExistingQuiz = ({ navigation, route }) => {
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const { showLoading, hideLoading } = useLoading();
	const { showAlert } = useAlert();
	const slideAnim = useRef(new Animated.Value(height)).current;
	const ClassID = route.params.ClassID;
	const ActivityTypeID = route.params.ActivityTypeID;

	const handleClearSearch = () => setSearchQuery('');

	const fetchLocalData = async () => {
		try {
			setLoading(true);
			const res = await loadSurveyToLocal(user?.id);
			setData(res?.data);
		} catch (error) {
			showAlert('error', 'Error', 'Something went wrong fetching the data.');
		} finally {
			setLoading(false);
		}
	};

	// Fetch quizzes created by current user by passing user ID to API
	const fetchData = async () => {
		if (!user?.id) return;
		try {
			setLoading(true);
			// Pass user ID to API to fetch only their quizzes
			const res = await getTestBuilderData();
			const now = await saveSurveyToLocal(user?.id, res);
			console.log('res', res);
			setData(res);
		} catch (error) {
			showAlert('error', 'Error', 'Something went wrong fetching the data.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLocalData();
	}, [user?.id]);

	const openModal = () => {
		setShowModal(true);
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true,
		}).start();
	};

	const closeModal = () => {
		Animated.timing(slideAnim, {
			toValue: height,
			duration: 250,
			useNativeDriver: true,
		}).start(() => setShowModal(false));
	};

	const handleViewItem = (id) => {
		navigation.navigate('SurveyTest', { id });
	};

	const handleOption = () => {
		closeModal();
		navigation.navigate('CreateTest');
	};

	const userQuizzes = useMemo(() => {
		return data;
	}, [data, user?.id]);

	const filteredQuizzes = useMemo(() => {
		if (!searchQuery.trim()) return userQuizzes;
		const q = searchQuery.toLowerCase();
		return userQuizzes.filter(item => {
			const title = item.Title || '';
			const description = item.Description || '';
			return title.toLowerCase().includes(q) || description.toLowerCase().includes(q);
		});
	}, [searchQuery, userQuizzes]);


	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={[globalStyles.card, globalStyles.cardSpacing, { padding: 0, borderWidth: 1, borderColor: '#ccc' }]}
			onPress={() => handleViewItem(item.id)}
		>
			<View style={[globalStyles.p_2]}>
				<CText fontSize={17} fontStyle="SB" style={{ color: '#000' }}>
					{item.Title}
				</CText>
				<CText fontSize={14} style={{ color: '#444', marginTop: 4 }}>
					{item.Description}
				</CText>
				<View style={[globalStyles.cardRow, { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }]}>
					<CText fontSize={12} style={{ color: '#777' }}>
						Created {formatDate(item.created_at, 'relative')}
					</CText>
					<CText fontSize={12} style={{ color: '#777' }}>
						Items: {item.questions.length}
					</CText>
				</View>

				{/* Add the Use button */}
				<View style={{ marginTop: 10, alignItems: 'flex-end' }}>
					<TouchableOpacity
						style={{
							backgroundColor: theme.colors.light.primary,
							paddingVertical: 6,
							paddingHorizontal: 15,
							borderRadius: 6,
						}}
						onPress={() => handleUse(item)} // define this handler
					>
						<CText fontSize={14} style={{ color: '#fff' }}>
							Use
						</CText>
					</TouchableOpacity>
				</View>
			</View>
		</TouchableOpacity>
	);

	const handleUse = (item) => {
		navigation.navigate('AddActivity', { ClassID, ActivityTypeID, FormID: item.id });
	};

	const loadData = () => {
		fetchData();
	};

	if (true) {
		return (
			<>
				<BackHeader title="Test Builder" />
				<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 100}]}>
					<View style={styles.container}>
				<View style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20,
				}}>
					<View style={{
						backgroundColor: theme.colors.light.primary,
						padding: 20,
						borderRadius: 8,
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.25,
						shadowRadius: 3.84,
						elevation: 5,
					}}>
						<Text style={{
							fontSize: 18,
							fontWeight: 'bold',
							color: theme.colors.light.card,
							textAlign: 'center'
						}}>
							⚠️ This screen is still under development ⚠️
						</Text>
						<Text style={{
							fontSize: 14,
							color: theme.colors.light.card,
							textAlign: 'center',
							marginTop: 5
						}}>
							Hang tight! Cool stuff is coming soon 🚀
						</Text>
					</View>
				</View>
					</View>
				</SafeAreaView>
			</>
		);
	};

	return (
		<>
			<BackHeader title="Test Builder" />
			<SafeAreaView style={[globalStyles.safeArea, {paddingTop: 100}]}>
				<View style={styles.container}>
					<View style={styles.searchBox}>
						<Icon name="search-outline" size={18} color="#999" style={styles.searchIcon} />
						<TextInput
							placeholder="Search tests..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							style={styles.searchInput}
							placeholderTextColor="#aaa"
							autoCorrect={false}
							autoCapitalize="none"
						/>
						{searchQuery !== '' && (
							<TouchableOpacity onPress={handleClearSearch} style={styles.clearIcon}>
								<Icon name="close-circle" size={18} color="#aaa" />
							</TouchableOpacity>
						)}
					</View>
					{loading && (
						<ActivityIndicator2 />
					)}
					{loading ? (
						<ShimmerList />
					) : filteredQuizzes.length === 0 ? (
						<View style={styles.emptyState}>
							<CText>No quizzes found.</CText>
						</View>
					) : (
						<FlatList
							data={filteredQuizzes}
							renderItem={renderItem}
							keyExtractor={(item) => item.id?.toString() ?? `${item.id}-${Math.random()}`}
							refreshing={loading}
							onRefresh={loadData}
							showsVerticalScrollIndicator={false}
						/>
					)}
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	searchBox: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: theme.radius.sm,
		paddingHorizontal: 15,
		height: 45,
		backgroundColor: '#f9f9f9',
	},
	searchInput: { flex: 1, height: 40, fontSize: 15, color: '#000' },
	searchIcon: { marginRight: 6 },
	clearIcon: { marginLeft: 6 },
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default UseExistingQuiz;
