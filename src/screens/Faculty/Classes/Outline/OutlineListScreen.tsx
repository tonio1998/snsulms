import React, { useEffect, useState } from "react";
import {
	SafeAreaView,
	View,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	RefreshControl, SectionList
} from "react-native";
import { useAuth } from "../../../../context/AuthContext.tsx";
import { globalStyles } from "../../../../theme/styles.ts";
import { CText } from "../../../../components/common/CText.tsx";
import BackHeader from "../../../../components/layout/BackHeader.tsx";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../../api/api.ts";
import ActivityIndicator2 from "../../../../components/loaders/ActivityIndicator2.tsx";
import {handleApiError} from "../../../../utils/errorHandler.ts";
import {getOutline} from "../../../../api/modules/outlineApi.ts";
import {formatDate} from "date-fns";
import Icon from "react-native-vector-icons/Ionicons";

const OutlineListScreen = ({ navigation, route }) => {
	const { user } = useAuth();
	const { ClassID } = route.params;
	const [loading, setLoading] = useState(false);
	const [outlines, setOutlines] = useState([]);

	useEffect(() => {
		fetchOutlines();
	}, []);

	const fetchLocal = async () => {
		const { data, date } = await loadOutlineFromLocal(ClassID);
		if (data) {
			setOutlines(data);
			setLastFetched(date);
			setLoading(false);
		} else {
			await fetchOutlines();
		}
	};

	const fetchOutlines = async () => {
		try {
			setLoading(true);
			const res = await getOutline({ClassID});
			console.log("🔍 Fetched outlines", res);
			// return;
			setOutlines(res || []);
		} catch (error) {
			console.log("❌ Failed to fetch outlines", error);
			handleApiError(error, "Failed to fetch outlines");
		} finally {
			setLoading(false);
		}
	};

	const renderItem = ({ item }) => (
		<View>
			<CText fontStyle="B" fontSize={16} style={{ marginBottom: 6 }}>
				{item.Term}
			</CText>

			{item.Topics.map((topic, index) => (
				<TouchableOpacity
					key={index}
					style={styles.item}
					onPress={() => navigation.navigate("OutlineDetails", { outline: topic })}
				>
					<CText fontStyle="SB" fontSize={15}>{topic.Title}</CText>

					{topic.Description ? (
						<CText fontSize={13} style={{ color: "#666" }}>
							{topic.Description}
						</CText>
					) : null}

					<CText fontSize={12} style={{ marginTop: 4, color: "#888" }}>
						{formatDate(topic.DateFrom, "MMM dd, yyyy")} – {formatDate(topic.DateTo, "MMM dd, yyyy")}
					</CText>
				</TouchableOpacity>
			))}
		</View>
	);


	return (
		<>
			<BackHeader title="Class Outline" goTo={{ tab: 'MainTabs', screen: 'Classes' }} />
			<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 100 }]}>
				<View style={{ flex: 1, paddingHorizontal: 16 }}>.
					{loading && (
						<>
							<ActivityIndicator2 />
						</>
					)}

					<SectionList
						sections={outlines.map(section => ({
							title: section?.Term,
							data: section?.Topics
						}))}
						keyExtractor={(item) => item.ClassTopicID}
						renderSectionHeader={({ section: { title } }) => (
							<CText fontStyle="B" fontSize={16} style={{ marginVertical: 8 }}>
								{title}
							</CText>
						)}
						renderItem={({ item }) => (
							<TouchableOpacity
								style={styles.item}
								onPress={() => navigation.navigate("OutlineDetails", { outline: item })}
							>
								<CText fontStyle="SB" fontSize={15}>{item.Title}</CText>
								{item.Description ? (
									<CText fontSize={13} style={{ color: "#666" }}>{item.Description}</CText>
								) : null}
								<CText fontSize={12} style={{ marginTop: 4, color: "#888" }}>
									{formatDate(item.DateFrom, "MMM dd, yyyy")} – {formatDate(item.DateTo, "MMM dd, yyyy")}
								</CText>
							</TouchableOpacity>
						)}
						refreshControl={
							<RefreshControl refreshing={loading} onRefresh={fetchOutlines} />
						}
						ListEmptyComponent={
							<CText style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
								No outlines found.
							</CText>
						}
					/>

					<TouchableOpacity
						onPress={() => navigation.navigate("AddOutline", { ClassID })}
						style={[globalStyles.fab, {
							margin: 15,
							width: 60,
							height: 60,
							borderRadius: 50
						}]}
					>
						<Icon name="add" size={28} color="#fff" />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	item: {
		padding: 12,
		backgroundColor: "#fff",
		borderRadius: 8,
		marginBottom: 10,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
		elevation: 2,
	},
	fab: {
		position: "absolute",
		right: 20,
		bottom: 30,
		backgroundColor: "#007AFF",
		width: 55,
		height: 55,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
	},
});

export default OutlineListScreen;
