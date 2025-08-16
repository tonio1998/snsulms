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
    Switch,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// Layout & UI Components
import BackHeader from "../../../components/layout/BackHeader.tsx";
import CButton from "../../../components/buttons/CButton.tsx";

// Theme & Styles
import { globalStyles } from "../../../theme/styles.ts";
import { theme } from "../../../theme";

// API
import {
    addSection,
    deleteQuestion,
    getSurveyData,
    updateQuestionRequired,
} from "../../../api/testBuilder/testbuilderApi.ts";
import {RenderAnswerPreview} from "../../../components/testBuilder/RenderAnswerPreview.tsx";
import ActivityIndicator2 from "../../../components/loaders/ActivityIndicator2.tsx";
import {fetchSurveyData, localupdateSurveyDate} from "../../../utils/cache/Survey/localSurvey";
import {useAuth} from "../../../context/AuthContext.tsx";
import {LastUpdatedBadge} from "../../../components/common/LastUpdatedBadge";
import {useFocusEffect} from "@react-navigation/native";

export default function QuestionsScreen({ navigation, route }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const [form, setForm] = useState({});

    // Section modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");
    const [newSectionDesc, setNewSectionDesc] = useState("");
    const [savingSection, setSavingSection] = useState(false);
    const [lastFetched, setLastFetched] = useState(null);

    const SurveyID = route.params.SurveyID;

    /** Load all sections from server */
    const loadSections = async () => {
        try {
            setLoading(true);
            // const data = await getSurveyData({ SurveyID });
            const data = await fetchSurveyData(user?.id, SurveyID);
            console.log('from cache: ', data);
            setSections(data?.sections || []);
            setForm(data);
            setLastFetched(data?.date);
        } catch (error) {
            console.error("Failed to load sections:", error);
            Alert.alert("Error", "Failed to load sections from server.");
        } finally {
            setLoading(false);
        }
    };

    /** Pull-to-refresh handler */
    const onRefresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSurveyData({ SurveyID });
            await localupdateSurveyDate(user?.id, SurveyID, data);
            setLastFetched(new Date());
            setSections(data?.sections || []);
        } catch (error) {
            Alert.alert("Error", "Failed to refresh sections.");
        } finally {
            setLoading(false);
        }
    }, [SurveyID]);


    useFocusEffect(
        useCallback(() => {
            loadSections();
            return () => {
            };
        }, [SurveyID])
    );

    /** Delete a question */
    const handleDeleteQuestion = (questionId) => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this question?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        // Optimistic update
                        setSections((prev) =>
                            prev.map((section) => ({
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
        ]);
    };

    /** Toggle required status */
    const handleToggleRequired = async (questionId, currentValue) => {
        try {
            // Optimistic UI update
            setSections((prev) =>
                prev.map((section) => ({
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

    /** Render single question */
    const renderQuestion = ({ item }) => (
        <View style={styles.questionItem}>
            <View style={styles.questionTextContainer}>
                <Text style={styles.questionText}>{item.Question}</Text>
                <RenderAnswerPreview type={item.AnswerType} choices={item.Options} items={item} />
            </View>

            <View style={styles.actionRow}>
                <View style={styles.requiredRow}>
                    <Text style={styles.requiredLabel}>Required</Text>
                    <Switch
                        value={!!item.isRequired}
                        onValueChange={() => handleToggleRequired(item.id, !!item.isRequired)}
                        trackColor={{ false: "#ccc", true: theme.colors.light.primary }}
                        thumbColor={item.isRequired ? "#fff" : "#f4f3f4"}
                    />
                </View>

                <View style={styles.actionsRight}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("AddQuestionScreen", {
                                questionId: item.id,
                                sectionId: item.SectionID,
                            })
                        }
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
                        onPress={() => navigation.navigate("QuizStartScreen", { SurveyID, FormStatus: 'test' })}
                    />
                }
            />

            <SafeAreaView style={globalStyles.safeArea}>
                <View style={{paddingHorizontal: 16}}>
                    <LastUpdatedBadge date={lastFetched} onReload={onRefresh} />
                </View>
                {loading ? <ActivityIndicator2 /> : null}

                {sections.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No sections found.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={sections}
                        keyExtractor={(s, index) => (s?.id ? s.id.toString() : index.toString())}

                        renderItem={({ item }) => (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>{item.SectionTitle}</Text>

                                {item.questions && item.questions.length > 0 ? (
                                    <FlatList
                                        data={item.questions}
                                        keyExtractor={(q) => q.id.toString()}
                                        renderItem={renderQuestion}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <Text style={styles.noQuestionsText}>No questions yet.</Text>
                                )}

                                <View>
                                    <TouchableOpacity
                                        style={styles.addQuestionBtn}
                                        onPress={() => navigation.navigate("AddQuestionScreen", { sectionId: item.id, SurveyID })}
                                    >
                                        <Icon name="add" size={20} color="#fff" />
                                        <Text style={styles.addQuestionBtnText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
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

                <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
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
        padding: 10,
        marginBottom: 8,
    },
    questionText: {
        fontSize: 17,
        color: "#333",
        flex: 1,
        marginRight: 12,
    },
    actionRow: {
        borderTopWidth: 1,
        borderColor: "#eee",
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    requiredRow: { flexDirection: "row", alignItems: "center" },
    requiredLabel: { marginRight: 8, color: "#555" },
    actionsRight: { flexDirection: "row" },
    iconBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#eee",
        margin: 5,
    },
    addQuestionBtn: {
        marginTop: 14,
        backgroundColor: theme.colors.light.primary,
        width: "23%",
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    addQuestionBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: "600",
    },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { fontSize: 18, color: "#999" },
    noQuestionsText: { fontStyle: "italic", color: "#999" },
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
    modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
    modalBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 6, marginLeft: 12 },
    modalBtnText: { fontSize: 16, fontWeight: "600" },
});
