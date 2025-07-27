import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	SafeAreaView,
	Image,
	StyleSheet,
	Linking,
	RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { handleApiError } from '../../../utils/errorHandler';
import { globalStyles } from '../../../theme/styles';
import { CText } from '../../../components/CText';
import { theme } from '../../../theme';
import { NetworkContext } from '../../../context/NetworkContext';
import {FILE_BASE_URL} from "../../../api/api_configuration.ts";
import {getMyClassmates} from "../../../api/modules/classmatesApi.ts";
import {useLoading} from "../../../context/LoadingContext.tsx";

const PeopleScreen = ({ navigation, route }) => {
	const ClassID = route.params.ClassID;
	const [classmates, setClassmates] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showLoading, hideLoading } = useLoading();
	const network = useContext(NetworkContext);


	const fetchClassmates = async () => {
		try {
			setLoading(true);
			showLoading("Loading...")

			if (network?.isOnline) {
				let List = [];
				const filter = {
					page: 1,
					search: '',
					ClassID: ClassID
				};
				const response = await getMyClassmates(filter);
				List = response?.data ?? [];
				console.log(List)
				setClassmates(List);
			} else {
			}
		} catch (error) {
			handleApiError(error, "Df");
		} finally {
			setLoading(false);
			hideLoading()
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchClassmates();
		}, [])
	);

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchClassmates();
		setRefreshing(false);
	};

	const handleEmailPress = (email) => {
		Linking.openURL(`mailto:${email}`);
	};

	const renderItem = ({ item }) => (
		<View style={styles.card}>
			<Image
				source={
					item.student_info?.user?.profile_pic
						? { uri: item.student_info.user.profile_pic }
						: item.student_info?.user?.avatar
							? { uri: item.student_info.user.avatar }
							: {
								uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
									item.student_info?.user?.name || 'User'
								)}&background=random`,
							}
				}
				style={styles.avatar}
			/>

			<View style={{ flex: 1 }}>
				<CText style={styles.name} fontStyle={'SB'} fontSize={14.5}>{item.student_info?.FirstName} {item.student_info?.LastName}</CText>
				<TouchableOpacity onPress={() => handleEmailPress(item.student_info?.user?.email)}>
					<CText style={styles.email}>{item.student_info?.user?.email}</CText>
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 10 }]}>
			<FlatList
				data={classmates}
				keyExtractor={(item, index) => index.toString()}
				renderItem={renderItem}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				ListEmptyComponent={
					!loading && (
						<CText style={styles.emptyText}>No classmates found 😶</CText>
					)
				}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	header: {
		fontSize: 20,
		fontWeight: 'bold',
		padding: 16,
		color: theme.colors.light.primary,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		marginHorizontal: 16,
		marginBottom: 12,
		padding: 12,
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		// elevation: 3,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
		backgroundColor: '#ccc',
	},
	name: {
		color: '#222',
	},
	email: {
		fontSize: 14,
		// color: theme.colors.light.primary,
		// textDecorationLine: 'underline',
		marginTop: 4,
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 40,
		color: '#999',
	},
});

export default PeopleScreen;
