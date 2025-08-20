import React, {useState, useRef, useEffect} from 'react';
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
    Text,
} from 'react-native';
import CustomHeader from "../../components/layout/CustomHeader.tsx";
import {globalStyles} from "../../theme/styles.ts";
import Icon from "react-native-vector-icons/Ionicons";
import {CText} from "../../components/common/CText.tsx";
import {theme} from "../../theme";
import {useLoading} from "../../context/LoadingContext.tsx";
import {useAlert} from "../../components/CAlert.tsx";
import {getTestBuilderData} from "../../api/testBuilder/testbuilderApi.ts";
import {ShimmerList} from "../../components/loaders/ShimmerList.tsx";
import {formatDate} from "../../utils/dateFormatter";
import CustomHeader2 from "../../components/layout/CustomHeader2.tsx";
import {loadSurveyToLocal, saveSurveyToLocal} from "../../utils/cache/Survey/localSurvey";
import {useAuth} from "../../context/AuthContext.tsx";
import {handleApiError} from "../../utils/errorHandler.ts";
import {LastUpdatedBadge} from "../../components/common/LastUpdatedBadge";

const { height } = Dimensions.get('window');

const TestBuilderScreen = ({ navigation }) => {
	const {user} = useAuth();
	const [searchQuery, setSearchQuery] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const { showLoading, hideLoading } = useLoading();
	const { showAlert } = useAlert();
	const [lastFetch, setLastFetch] = useState(0);
	const slideAnim = useRef(new Animated.Value(height)).current;

	const handleClearSearch = () => setSearchQuery('');

	const fetchLocalData = async () => {
		try {
			setLoading(true);
			showLoading('Loading...');
			const res = await loadSurveyToLocal(user?.id);
			setLastFetch(res?.date)
			setData(res?.data);
		} catch (error) {
			showAlert('error', 'Error', 'Something went wrong fetching the data.');
		} finally {
			hideLoading();
			setLoading(false);
		}
	};

	const fetchData = async () => {
		try {
			setLoading(true);
			showLoading('Loading...');
			const res = await getTestBuilderData();
			const now = await saveSurveyToLocal(user?.id, res);
			setLastFetch(now);
			setData(res);
		} catch (error) {
			showAlert('error', 'Error', 'Something went wrong fetching the data.');
			handleApiError(error, "dfdfd");
		} finally {
			setLoading(false);
			hideLoading();
		}
	};

	useEffect(() => {
		fetchLocalData();
	}, []);

	if (false) {
		return (
			<>
				<View style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: theme.colors.light.primary + '33',
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
			</>
		);
	};


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
		navigation.navigate('SurveyTest', {id});
	};

	const handleOption = () => {
		closeModal();
		navigation.navigate('CreateTest');
	};

	const renderItem = ({ item }) => {
		return (
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
				</View>
			</TouchableOpacity>
		);
	};

	const loadData = () => {
		fetchData();
	};

	return (
		<>
			<SafeAreaView style={globalStyles.safeArea2}>
				<View style={styles.container}>
					{/* Search Box */}
					<View style={styles.searchBox}>
						<Icon name="search-outline" size={18} color="#999" style={styles.searchIcon} />
						<TextInput
							placeholder="Search tests..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							style={styles.searchInput}
							placeholderTextColor="#aaa"
						/>
						{searchQuery !== '' && (
							<TouchableOpacity onPress={handleClearSearch} style={styles.clearIcon}>
								<Icon name="close-circle" size={18} color="#aaa" />
							</TouchableOpacity>
						)}
					</View>

					<LastUpdatedBadge date={lastFetch} onReload={fetchData} />

					<ShimmerList
						data={data}
						loading={loading}
						renderItem={renderItem}
						keyExtractor={(item) =>
							item.id?.toString() ?? `${item.id}-${Math.random()}`
						}
						onRefresh={loadData}
					/>
				</View>

				{/* FAB */}
				<TouchableOpacity style={globalStyles.fab} activeOpacity={0.7} onPress={openModal}>
					<Icon name="add" size={28} color="#fff" />
				</TouchableOpacity>

				{/* Modal */}
				{showModal && (
					<Modal transparent visible={showModal} animationType="fade">
						<TouchableOpacity style={globalStyles.overlay} activeOpacity={1} onPress={closeModal} />
						<Animated.View style={[globalStyles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
							<TouchableOpacity style={globalStyles.option} onPress={handleOption}>
								<CText fontStyle="SB" fontSize={16}>Create Test</CText>
							</TouchableOpacity>
							<TouchableOpacity style={globalStyles.cancel} onPress={closeModal}>
								<CText fontStyle="SB" fontSize={15} style={{ color: '#ff5555' }}>Cancel</CText>
							</TouchableOpacity>
						</Animated.View>
					</Modal>
				)}
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

export default TestBuilderScreen;
