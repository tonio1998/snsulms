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
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import { getSurveyData } from "../../api/modules/testbuilderApi.ts";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function QuestionsScreen({ navigation, route }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedSections, setExpandedSections] = useState({}); // track expanded sections by id
    const SurveyID = route.params.SurveyID;

    const loadSections = async () => {
        try {
            setLoading(true);
            const data = await getSurveyData({ SurveyID });
            setSections(data?.sections || []);
            // expand all sections by default or collapse all? Let's collapse all:
            setExpandedSections({});
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
            setExpandedSections({});
        } catch (error) {
            Alert.alert("Error", "Failed to refresh sections.");
        } finally {
            setRefreshing(false);
        }
    }, [SurveyID]);

    useEffect(() => {
        loadSections();
    }, [SurveyID]);

    const toggleSection = (sectionId) => {
        // Animate layout change
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const renderQuestion = ({ item }) => (
        <View style={styles.questionItem}>
            <Text style={{ color: "#333" }}>{item.Question}</Text>
        </View>
    );

    const renderSection = ({ item }) => {
        const isExpanded = !!expandedSections[item.id];
        return (
            <View style={styles.sectionCard}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleSection(item.id)}
                >
                    <Text style={styles.sectionTitle}>{item.SectionTitle}</Text>
                    <Icon
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#007AFF"
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <>
                        {item.questions && item.questions.length > 0 ? (
                            <FlatList
                                data={item.questions}
                                keyExtractor={(q) => q.id.toString()}
                                renderItem={renderQuestion}
                                nestedScrollEnabled
                                scrollEnabled={false} // disable scrolling inside questions list to avoid conflicts
                            />
                        ) : (
                            <Text style={styles.noQuestionsText}>No questions yet.</Text>
                        )}

                        <TouchableOpacity
                            style={styles.addQuestionBtn}
                            onPress={() =>
                                navigation.navigate("AddQuestionScreen", { sectionId: item.id })
                            }
                        >
                            <Icon name="add-circle-outline" size={24} color="#007AFF" />
                            <Text style={styles.addQuestionBtnText}>Add Question</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView
                style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
            >
                <ActivityIndicator size="large" color="#007AFF" />
            </SafeAreaView>
        );
    }

    return (
        <>
            <BackHeader />
            <SafeAreaView style={globalStyles.safeArea}>
                {sections.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No sections found.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={sections}
                        keyExtractor={(s) => s.id.toString()}
                        renderItem={renderSection}
                        contentContainerStyle={{ padding: 14 }}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                )}

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate("AddSection")}
                >
                    <Icon name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#222",
    },
    questionItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    addQuestionBtn: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    addQuestionBtnText: {
        color: "#007AFF",
        fontSize: 16,
        marginLeft: 6,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 40,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
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
});
