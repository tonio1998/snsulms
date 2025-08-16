import React, { useState } from 'react';
import {
	View,
	TextInput,
	TouchableOpacity,
	SafeAreaView,
	StyleSheet,
	ScrollView,
	Switch
} from 'react-native';
import { CText } from "../../components/common/CText.tsx";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { theme } from "../../theme";
import { useLoading } from "../../context/LoadingContext.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { createTestForm } from "../../api/testBuilder/testbuilderApi.ts";
import {globalStyles} from "../../theme/styles.ts"; // 👈 create API

const CreateTestFormScreen = ({ navigation }) => {
	const { showLoading, hideLoading } = useLoading();
	const { showAlert } = useAlert();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [duration, setDuration] = useState('');
	const [isPublished, setisPublished] = useState(false);
	const [isShuffle, setIsShuffle] = useState(false);
	const [isCardView, setIsCardView] = useState(false);

	const handleSave = async () => {
		if (!title.trim()) {
			showAlert("warning", "Validation", "Title is required.");
			return;
		}

		try {
			showLoading("Saving...");
			await createTestForm({
				Title: title,
				Description: description,
				Duration: parseInt(duration) || 0,
				isPublished: isPublished ? 1 : 0,
				isShuffle: isShuffle ? 1 : 0,
				isCardView: isCardView ? 1 : 0,
			});
			hideLoading();
			showAlert("success", "Success", "Test created successfully!");
			navigation.goBack();
		} catch (error) {
			hideLoading();
			showAlert("error", "Error", error.message || "Something went wrong.");
		}
	};

	return (
		<>
			<BackHeader title="New Test" />
			<SafeAreaView style={globalStyles.safeArea}>
				<ScrollView contentContainerStyle={styles.container}>
					<CText fontSize={15} fontStyle="SB">Title</CText>
					<TextInput
						style={styles.input}
						placeholder="Enter test title"
						value={title}
						onChangeText={setTitle}
					/>

					<CText fontSize={15} fontStyle="SB" style={styles.label}>Description</CText>
					<TextInput
						style={[styles.input, { height: 80 }]}
						placeholder="Enter description"
						multiline
						value={description}
						onChangeText={setDescription}
					/>

					<CText fontSize={15} fontStyle="SB" style={styles.label}>Duration (minutes)</CText>
					<TextInput
						style={styles.input}
						placeholder="e.g. 30"
						keyboardType="numeric"
						value={duration}
						onChangeText={setDuration}
					/>

					<View style={styles.switchRow}>
						<CText fontStyle={'SB'} fontSize={15}>Publish this Form</CText>
						<Switch value={isPublished} onValueChange={setisPublished} trackColor={{ false: "#ccc", true: theme.colors.light.primary }}
								thumbColor={isCardView ? "#fff" : "#f4f3f4"}/>
					</View>
					<View style={styles.switchRow}>
						<CText fontStyle={'SB'} fontSize={15}>Shuffle Questions</CText>
						<Switch value={isShuffle} onValueChange={setIsShuffle} trackColor={{ false: "#ccc", true: theme.colors.light.primary }}
								thumbColor={isCardView ? "#fff" : "#f4f3f4"}/>
					</View>
					<View style={styles.switchRow}>
						<CText fontStyle={'SB'} fontSize={15}>Enable Card View</CText>
						<Switch
							value={isCardView}
							onValueChange={setIsCardView}
							trackColor={{ false: "#ccc", true: theme.colors.light.primary }}
							thumbColor={isCardView ? "#fff" : "#f4f3f4"}
						/>
					</View>

					<TouchableOpacity style={styles.button} onPress={handleSave}>
						<CText fontSize={16} fontStyle="SB" style={{ color: "#fff" }}>Save Test</CText>
					</TouchableOpacity>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#fff" },
	container: { padding: 16 },
	label: { marginTop: 12 },
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: theme.radius.xs,
		padding: 10,
		marginTop: 6,
		fontSize: 15,
		backgroundColor: "#f9f9f9",
	},
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 15,
	},
	button: {
		backgroundColor: theme.colors.light.primary,
		padding: 14,
		borderRadius: theme.radius.sm,
		alignItems: "center",
		marginTop: 24,
	},
});

export default CreateTestFormScreen;
