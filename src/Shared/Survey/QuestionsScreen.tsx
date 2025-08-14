import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
    Platform,
    Switch,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import {
    addSection,
    deleteQuestion,
    getSurveyData,
    updateQuestionRequired /*, updateQuestionRequired*/
} from "../../api/testBuilder/testbuilderApi.ts";
import { theme } from "../../theme";
import CButton from "../../components/buttons/CButton.tsx";
import QuizScreen from "./QuizScreen.tsx";
import {RenderAnswerPreview} from "../../components/testBuilder/renderAnswerPreview.tsx";

export default function QuestionsScreen({ navigation, route }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");
    const [newSectionDesc, setNewSectionDesc] = useState("");
    const [savingSection, setSavingSection] = useState(false);

    const SurveyID = route.params.SurveyID;

    const loadSections = async () => {
        try {
            setLoading(true);
            const data = await getSurveyData({ SurveyID });
            setSections(data?.sections || []);
        } catch (error) {
            console.error("Failed to load sections:", error);
            Alert.alert("Error", "Failed to load sections from server.");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const data = await getSurveyData({ SurveyID });
            setSections(data?.sections || []);
        } catch (error) {
            Alert.alert("Error", "Failed to refresh sections.");
        } finally {
            setRefreshing(false);
        }
    }, [SurveyID]);

    useEffect(() => {
        loadSections();
    }, [SurveyID]);

    const handleDeleteQuestion = (questionId) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this question?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setSections((prevSections) =>
                                prevSections.map((section) => ({
                                    ...section,
                                    questions: section.questions.filter((q) => q.id !== questionId),
                                }))
                            );

                            await deleteQuestion(questionId);
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete question. Please try again.");
                            console.error("Delete question error:", error);
                        }
                    },
                },
            ]
        );
    };

    const handleToggleRequired = async (questionId, currentValue) => {
        try {
            // Optimistic UI update
            setSections((prevSections) =>
                prevSections.map((section) => ({
                    ...section,
                    questions: section.questions.map((q) =>
                        q.id === questionId ? { ...q, isRequired: !currentValue } : q
                    ),
                }))
            );

            await updateQuestionRequired(questionId, !currentValue);
        } catch (error) {
            Alert.alert("Error", "Failed to update required status.");
            console.error("Toggle required error:", error);
        }
    };

    const renderQuestion = ({ item }) => (
        <View style={[styles.questionItem, { padding: 0, borderBottomWidth: 1, borderColor: "#eee" }]}>
            <View style={[styles.questionTextContainer, { padding: 10 }]}>
                <Text style={styles.questionText}>{item.Question}</Text>
                <RenderAnswerPreview type={item.AnswerType} choices={item.Options} items={item} />
            </View>

            <View
                style={[
                    styles.actionIcons,
                    {
                        borderTopWidth: 1,
                        borderColor: "#eee",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexDirection: "row",
                    },
                ]}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ marginRight: 8, color: "#555" }}>Required</Text>
                    <Switch
                        value={!!item.isRequired}
                        onValueChange={() => handleToggleRequired(item.id, !!item.isRequired)}
                        trackColor={{ false: "#ccc", true: theme.colors.light.primary }}
                        thumbColor={item.isRequired ? "#fff" : "#f4f3f4"}
                    />
                </View>

                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("AddQuestionScreen", { questionId: item.id, sectionId: item.SectionID })}
                        style={styles.iconBtn}
                    >
                        <Icon name="pencil" size={20} color={theme.colors.light.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteQuestion(item.id)} style={styles.iconBtn}>
                        <Icon name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const handleSaveSection = async () => {
        if (!newSectionTitle.trim()) {
            Alert.alert("Validation", "Section title cannot be empty.");
            return;
        }

        setSavingSection(true);
        try {
            await addSection(SurveyID, {
                SectionTitle: newSectionTitle.trim(),
                Description: newSectionDesc.trim(),
            });

            await loadSections();
            setNewSectionTitle("");
            setNewSectionDesc("");
            setModalVisible(false);
        } catch (error) {
            console.error("Failed to add section:", error);
            Alert.alert("Error", "Failed to save new section.");
        } finally {
            setSavingSection(false);
        }
    };

    return (
        <>
            <BackHeader
                rightButton={
                    <CButton
                        type="success"
                        title="Preview"
                        icon={"eye-outline"}
                        style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 }}
                        onPress={() => navigation.navigate("QuizStartScreen", { SurveyID: SurveyID })}
                    />
                }
            />
            <SafeAreaView style={globalStyles.safeArea}>
                {loading ? <ActivityIndicator size="large" color={theme.colors.light.primary} /> : null}
                {sections.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No sections found.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={sections}
                        keyExtractor={(s) => s.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>{item.SectionTitle}</Text>

                                {item.questions && item.questions.length > 0 ? (
                                    <FlatList
                                        data={item.questions}
                                        keyExtractor={(q) => q.id.toString()}
                                        renderItem={renderQuestion}
                                        scrollEnabled={false}
                                        nestedScrollEnabled
                                    />
                                ) : (
                                    <Text style={styles.noQuestionsText}>No questions yet.</Text>
                                )}

                                <TouchableOpacity
                                    style={styles.addQuestionBtn}
                                    onPress={() => navigation.navigate("AddQuestionScreen", { sectionId: item.id })}
                                >
                                    <Text style={styles.addQuestionBtnText}>Add Question</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                )}

                <TouchableOpacity style={globalStyles.fab} onPress={() => setModalVisible(true)}>
                    <Icon name="add" size={28} color="#fff" />
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={globalStyles.overlay}>
                        <View style={globalStyles.modalContainer}>
                            <Text style={globalStyles.modalTitle}>Add New Section</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Section Title"
                                value={newSectionTitle}
                                onChangeText={setNewSectionTitle}
                                editable={!savingSection}
                            />

                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                placeholder="Description (optional)"
                                value={newSectionDesc}
                                onChangeText={setNewSectionDesc}
                                multiline
                                editable={!savingSection}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={[styles.modalBtn, { backgroundColor: "#aaa" }]}
                                    disabled={savingSection}
                                >
                                    <Text style={styles.modalBtnText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleSaveSection}
                                    style={[styles.modalBtn, { backgroundColor: theme.colors.light.primary }]}
                                    disabled={savingSection}
                                >
                                    {savingSection ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={[styles.modalBtnText, { color: "#fff" }]}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionContainer: {
        marginBottom: 40,
        borderBottomWidth: 1,
        borderColor: "#ddd",
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
        marginBottom: 15,
    },
    questionItem: {
        borderBottomWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    questionTextContainer: {
        marginBottom: 8,
    },
    questionText: {
        fontSize: 17,
        color: "#333",
        flex: 1,
        marginRight: 12,
    },
    actionIcons: {
        flexDirection: "row",
    },
    iconBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#eee",
        margin: 5,
    },
    shortInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        height: 38,
        color: "#666",
        backgroundColor: "#f9f9f9",
    },
    paragraphInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 10,
        minHeight: 70,
        textAlignVertical: "top",
        color: "#666",
        backgroundColor: "#f9f9f9",
    },
    addQuestionBtn: {
        alignItems: "center",
        marginTop: 14,
        backgroundColor: "#fff",
        width: "40%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
    },
    addQuestionBtnText: {
        color: "#007AFF",
        fontSize: 16,
        marginLeft: 6,
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 18,
        color: "#999",
    },
    noQuestionsText: {
        fontStyle: "italic",
        color: "#999",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        width: "85%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 15,
        color: "#222",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 16,
        marginBottom: 14,
        backgroundColor: "#f9f9f9",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
        marginLeft: 12,
    },
    modalBtnText: {
        fontSize: 16,
        fontWeight: "600",
    },
});
