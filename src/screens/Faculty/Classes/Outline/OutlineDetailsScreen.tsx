import React from "react";
import {
	SafeAreaView,
	View,
	StyleSheet,
} from "react-native";
import { useAuth } from "../../../../context/AuthContext.tsx";
import { globalStyles } from "../../../../theme/styles.ts";
import { CText } from "../../../../components/common/CText.tsx";
import BackHeader from "../../../../components/layout/BackHeader.tsx";
import { format } from "date-fns";

const OutlineDetailsScreen = ({ navigation, route }) => {
	const { user } = useAuth();
	const { outline } = route.params;

	console.log("🔍 Fetching outline details", outline);

	return (
		<>
			<BackHeader title={outline?.Title} />
			<SafeAreaView style={[globalStyles.safeArea, { paddingTop: 100 }]}>
				<View style={{
					marginHorizontal: 16,
					paddingHorizontal: 20,
					paddingVertical: 16,
					backgroundColor: "#fff",
					elevation: 2,
					shadowColor: "#000",
					shadowOpacity: 0.1,
					shadowRadius: 4,
					shadowOffset: { width: 0, height: 2 },
					borderRadius: 8,
				}}>
					<DetailItem label="Term" value={outline?.Term} />
					<DetailItem label="Title" value={outline?.Title} />
					<DetailItem label="Description" value={outline?.Description} />
					<DetailItem
						label="Duration"
						value={`${format(new Date(outline?.DateFrom), "MMM dd, yyyy")} – ${format(new Date(outline?.DateTo), "MMM dd, yyyy")}`}
					/>
				</View>
			</SafeAreaView>
		</>
	);
};

const DetailItem = ({ label, value }) => (
	<View style={{ marginBottom: 12 }}>
		<CText fontStyle="M" fontSize={14} style={{ color: "#888" }}>
			{label}
		</CText>
		<CText fontStyle="SB" fontSize={16}>
			{value || "—"}
		</CText>
	</View>
);

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

export default OutlineDetailsScreen;
