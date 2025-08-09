import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const questionTypes = [
    { label: "Short Answer", value: "shortAnswer", icon: "create-outline" },
    { label: "Paragraph", value: "paragraph", icon: "document-text-outline" },
    { label: "Multiple Choice", value: "multipleChoice", icon: "radio-button-on-outline" },
    { label: "Checkboxes", value: "checkbox", icon: "checkbox-outline" },
    { label: "Dropdown", value: "dropdown", icon: "caret-down-outline" },
    { label: "Scale", value: "scale", icon: "options-outline" },
    { label: "MC Grid", value: "multipleChoiceGrid", icon: "grid-outline" },
    { label: "Checkbox Grid", value: "checkboxGrid", icon: "grid-outline" },
    { label: "File Upload", value: "fileUpload", icon: "cloud-upload-outline" },
];

export default function AddQuestionScreen({ route, navigation }) {
    const { sectionId } = route.params;
    const [selectedType, setSelectedType] = useState(null);
    const [questionText, setQuestionText] = useState("");

    const saveQuestion = async () => {
        if (!selectedType) {
            Alert.alert("Error", "Please select a question type");
            return;
        }
        if (!questionText.trim()) {
            Alert.alert("Error", "Please enter question text");
            return;
        }

        // Replace with your API call to save question under sectionId
        console.log("Saving question:", {
            sectionId,
            type: selectedType,
            question: questionText,
        });

        // Fake delay
        setTimeout(() => {
            Alert.alert("Success", "Question saved!");
            navigation.goBack();
        }, 500);
    };

    return (
        <SafeAreaView style={{ flex: 1, padding: 14 }}>
            <Text style={styles.title}>Add Question</Text>

            <Text style={styles.label}>Select Question Type</Text>
            <FlatList
                data={questionTypes}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.typeItem,
                            selectedType === item.value && styles.typeItemSelected,
                        ]}
                        onPress={() => setSelectedType(item.value)}
                    >
                        <Icon name={item.icon} size={22} color="#007AFF" style={{ marginRight: 12 }} />
                        <Text style={styles.typeLabel}>{item.label}</Text>
                    </TouchableOpacity>
                )}
            />

            <Text style={styles.label}>Question Text</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your question here"
                value={questionText}
                onChangeText={setQuestionText}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveQuestion}>
                <Text style={styles.saveBtnText}>Save Question</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#222" },
    label: { fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 8, color: "#444" },
    typeItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
    },
    typeItemSelected: {
        backgroundColor: "#E0F0FF",
    },
    typeLabel: {
        fontSize: 16,
        color: "#007AFF",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
        color: "#333",
    },
    saveBtn: {
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    saveBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});
