import React, { useState } from "react";
import {
	SafeAreaView,
	View,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Platform,
	Alert,
} from "react-native";
import { useAuth } from "../../../../context/AuthContext.tsx";
import { globalStyles } from "../../../../theme/styles.ts";
import { CText } from "../../../../components/common/CText.tsx";
import BackHeader from "../../../../components/layout/BackHeader.tsx";
import { handleApiError } from "../../../../utils/errorHandler.ts";
import { addAttendance } from "../../../../api/modules/attendanceApi.ts";
import { theme } from "../../../../theme";
import CButton from "../../../../components/buttons/CButton.tsx";
import { useAlert } from "../../../../components/CAlert.tsx";

const AddAttendanceScreen = ({ navigation, route }) => {
	const { user } = useAuth();
	const { ClassID } = route.params;
	const { showAlert } = useAlert();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const onSubmit = async () => {
		if (!title.trim()) {
			Alert.alert("Validation", "Please enter a title");
			return;
		}
		if (!description.trim()) {
			Alert.alert("Validation", "Please enter a description");
			return;
		}

		try {
			setLoading(true);
			await addAttendance({
				ClassID,
				Title: title,
				Description: description,
				created_by: user?.id || 1,
				updated_by: user?.id || 1,
				created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
				status: "active",
				archived: 0,
			});

			showAlert("success", "Success", "Attendance added successfully.");
			navigation.goBack();
		} catch (error) {
			handleApiError(error, "Failed to add attendance");
			showAlert("error", "Error", error.response?.data?.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<BackHeader title="Add Attendance" />
			<SafeAreaView style={[globalStyles.safeArea]}>
				<ScrollView contentContainerStyle={{ padding: 16 }}>
					<CText fontStyle="SB" fontSize={15} style={{ marginBottom: 12 }}>
						Title
					</CText>
					<TextInput
						style={styles.input}
						placeholder="Enter title"
						value={title}
						onChangeText={setTitle}
					/>

					<CText fontStyle="SB" fontSize={15} style={{ marginBottom: 12, marginTop: 12 }}>
						Description
					</CText>
					<TextInput
						style={[styles.input, { height: 100, textAlignVertical: "top" }]}
						placeholder="Enter description"
						value={description}
						onChangeText={setDescription}
						multiline
					/>

					<CButton
						title={"Submit"}
						type={"success"}
						onPress={onSubmit}
						icon={"save-outline"}
						style={{ marginTop: 24, padding: 12 }}
						loading={loading}
					/>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	input: {
		backgroundColor: "#fff",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: "#ddd",
	},
});

export default AddAttendanceScreen;
