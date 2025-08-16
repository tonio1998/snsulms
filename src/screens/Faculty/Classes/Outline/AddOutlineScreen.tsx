import React, { useState } from "react";
import {
	SafeAreaView,
	View,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Platform,
	ScrollView,
} from "react-native";
import { useAuth } from "../../../../context/AuthContext.tsx";
import { globalStyles } from "../../../../theme/styles.ts";
import { CText } from "../../../../components/common/CText.tsx";
import BackHeader from "../../../../components/layout/BackHeader.tsx";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { handleApiError } from "../../../../utils/errorHandler.ts";
import {addOutline, createOutline} from "../../../../api/modules/outlineApi.ts";
import {theme} from "../../../../theme";
import CButton2 from "../../../../components/buttons/CButton2.tsx";
import CButton from "../../../../components/buttons/CButton.tsx";
import {useAlert} from "../../../../components/CAlert.tsx"; // <-- make sure you have this API

const AddOutlineScreen = ({ navigation, route }) => {
	const { user } = useAuth();
	const { ClassID } = route.params;

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dateFrom, setDateFrom] = useState(new Date());
	const [dateTo, setDateTo] = useState(new Date());
	const [showFromPicker, setShowFromPicker] = useState(false);
	const [showToPicker, setShowToPicker] = useState(false);
	const [loading, setLoading] = useState(false);
	const [term, setTerm] = useState(1);
	const { showAlert } = useAlert();

	const onSubmit = async () => {
		if (!title.trim()) {
			alert("Please enter a title");
			return;
		}
		try {
			setLoading(true);
			await addOutline({
				ClassID,
				Title: title,
				Description: description,
				Term: term,
				DateFrom: dateFrom.toISOString().split("T")[0],
				DateTo: dateTo.toISOString().split("T")[0],
			});
			showAlert('success', 'Success', 'Outline added successfully.');
			navigation.goBack();
		} catch (error) {
			handleApiError(error, "Failed to add outline");
			showAlert('error', 'Error', error.response?.data?.message);

		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<BackHeader title="Add Outline" />
			<SafeAreaView style={[globalStyles.safeArea]}>
				<ScrollView contentContainerStyle={{ padding: 16 }}>
					<View style={{ marginBottom: 16 }}>
						<CText fontStyle="SB" fontSize={15} style={{ marginBottom: 12 }}>
							Term
						</CText>
						<View style={{ flexDirection: "row", gap: 12 }}>
							<TouchableOpacity
								style={[
									styles.termButton,
									term === 1 && styles.termButtonActive
								]}
								onPress={() => setTerm(1)}
							>
								<CText style={term === 1 ? styles.termTextActive : styles.termText}>
									Midterm
								</CText>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.termButton,
									term === 2 && styles.termButtonActive
								]}
								onPress={() => setTerm(2)}
							>
								<CText style={term === 2 ? styles.termTextActive : styles.termText}>
									Final
								</CText>
							</TouchableOpacity>
						</View>
					</View>
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

					<View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
						<View style={{ flex: 1 }}>
							<CText fontStyle="SB" fontSize={15} style={{ marginBottom: 12, marginTop: 12 }}>
								Date From
							</CText>
							<TouchableOpacity
								style={styles.dateButton}
								onPress={() => setShowFromPicker(true)}
							>
								<CText>{dateFrom.toDateString()}</CText>
							</TouchableOpacity>
							{showFromPicker && (
								<DateTimePicker
									value={dateFrom}
									mode="date"
									display={Platform.OS === "ios" ? "inline" : "default"}
									onChange={(event, selectedDate) => {
										setShowFromPicker(false);
										if (selectedDate) {
											setDateFrom(selectedDate);

											const minDateTo = new Date(selectedDate);
											minDateTo.setDate(minDateTo.getDate() + 1);
											if (dateTo <= selectedDate) {
												setDateTo(minDateTo);
											}
										}
									}}
								/>
							)}
						</View>

						<View style={{ flex: 1 }}>
							<CText fontStyle="SB" fontSize={15} style={{ marginBottom: 12, marginTop: 12 }}>
								Date To
							</CText>
							<TouchableOpacity
								style={styles.dateButton}
								onPress={() => setShowToPicker(true)}
							>
								<CText>{dateTo.toDateString()}</CText>
							</TouchableOpacity>
							{showToPicker && (
								<DateTimePicker
									value={dateTo}
									mode="date"
									minimumDate={new Date(dateFrom.getTime() + 24 * 60 * 60 * 1000)}
									display={Platform.OS === "ios" ? "inline" : "default"}
									onChange={(event, selectedDate) => {
										setShowToPicker(false);
										if (selectedDate) setDateTo(selectedDate);
									}}
								/>
							)}
						</View>
					</View>



					<CButton
						title={'Submit'}
						type={'success'}
						onPress={onSubmit}
						icon={'save-outline'}
						style={{ marginTop: 24, padding: 12 }}
					/>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	termButton: {
		flex: 1,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 6,
		backgroundColor: "#fff",
		alignItems: "center",
	},
	termButtonActive: {
		backgroundColor: theme.colors.light.primary,
		// borderColor: "#007AFF",
	},
	termText: {
		color: "#333",
	},
	termTextActive: {
		color: "#fff",
		fontWeight: "600",
	},

	input: {
		backgroundColor: "#fff",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: "#ddd",
	},
	dateButton: {
		backgroundColor: "#fff",
		borderRadius: 6,
		padding: 12,
		borderWidth: 1,
		borderColor: "#ddd",
	},
});

export default AddOutlineScreen;
