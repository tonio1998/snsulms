import React, { useEffect, useState, useRef } from "react";
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
    Platform,
    UIManager,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import { endSurvey, getSurveyData, initSurvey, startSurvey } from "../../api/testBuilder/testbuilderApi.ts";
import { theme } from "../../theme";
import CButton from "../../components/buttons/CButton.tsx";
import { CText } from "../../components/common/CText.tsx";
import { useLoading } from "../../context/LoadingContext.tsx";
import { handleApiError } from "../../utils/errorHandler.ts";
import SurveyTimer from "../../components/testBuilder/SurveyTimer.tsx";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
export default function QuizScreen({ navigation, route }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [form, setForm] = useState({});
    const { showLoading, hideLoading } = useLoading();
    const [answers, setAnswers] = useState({});
    const [response, setResponse] = useState(null);
    const SurveyID = route.params.SurveyID;

    const loadSections = async () => {
        try {
            setLoading(true);
            const data = await getSurveyData({ SurveyID });
            setForm(data);
            setSections(data?.sections || []);
            const init = await initSurvey(SurveyID);
            if (init) setResponse(init);
        } catch (error) {
            Alert.alert("Error", "Failed to load sections from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSections();
    }, [SurveyID]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleStart = async () => {
        showLoading("Starting...");
        try {
            const res = await startSurvey(response?.id);
            if (res) {
                const startSeconds = Math.max(res?.RemainingTime || 0, 0) * 60;
                await AsyncStorage.setItem(`surveyTimer_${res.id}`, startSeconds.toString());
                setIsStarted(true);
            }
        } catch (error) {
            handleApiError(error, "Failed to start the survey");
        } finally {
            hideLoading();
        }
    };

    const AnswerInput = ({ question }) => {
        const answer = answers[question.id] ?? null;
        let parsedChoices = [];
        try {
            parsedChoices = typeof question.Options === "string" ? JSON.parse(question.Options) : question.Options;
        } catch {
            parsedChoices = [];
        }
        switch (question.AnswerType) {
            case "short":
                return (
                    <TextInput
                        style={styles.shortInput}
                        value={answer || ""}
                        onChangeText={(text) => handleAnswerChange(question.id, text)}
                        placeholder="Your answer"
                        placeholderTextColor="#ccc"
                    />
                );
            case "par":
                return (
                    <TextInput
                        style={styles.paragraphInput}
                        value={answer || ""}
                        onChangeText={(text) => handleAnswerChange(question.id, text)}
                        placeholder="Your answer"
                        multiline
                        numberOfLines={4}
                    />
                );
            case "mc":
                return (
                    <View>
                        {(Array.isArray(parsedChoices) ? parsedChoices : []).map((opt, i) => (
                            <TouchableOpacity key={i} style={styles.optionRow} onPress={() => handleAnswerChange(question.id, opt)}>
                                <Icon
                                    name={answers[question.id] === opt ? "radio-button-on" : "radio-button-off"}
                                    size={22}
                                    color={answers[question.id] === opt ? theme.colors.light.primary : "#888"}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={{ fontSize: 16 }}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case "checkbox":
                return (
                    <View>
                        {(Array.isArray(parsedChoices) ? parsedChoices : []).map((opt, i) => {
                            const selected = Array.isArray(answers[question.id]) && answers[question.id].includes(opt);
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.optionRow}
                                    onPress={() => {
                                        let newAnswer = Array.isArray(answers[question.id]) ? [...answers[question.id]] : [];
                                        if (selected) {
                                            newAnswer = newAnswer.filter((a) => a !== opt);
                                        } else {
                                            newAnswer.push(opt);
                                        }
                                        handleAnswerChange(question.id, newAnswer);
                                    }}
                                >
                                    <Icon
                                        name={selected ? "checkbox" : "square-outline"}
                                        size={22}
                                        color={selected ? theme.colors.light.primary : "#888"}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={{ fontSize: 16 }}>{opt}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );
            case "linear":
                const scaleRange = [];
                for (let i = question.ScaleMin; i <= question.ScaleMax; i++) {
                    scaleRange.push(i);
                }
                return (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, gap: 10 }}>
                        {scaleRange.map((val) => {
                            const selected = answer === val;
                            return (
                                <TouchableOpacity
                                    key={val}
                                    style={[styles.linearScaleCircle, selected && { backgroundColor: theme.colors.light.primary }]}
                                    onPress={() => handleAnswerChange(question.id, val)}
                                >
                                    <Text style={[styles.linearScaleText, selected && { color: "#fff" }]}>{val}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );
            default:
                return <Text style={{ color: "#999" }}>Unsupported question type</Text>;
        }
    };

    const renderQuestion = ({ item }) => (
        <View style={[styles.questionItem, { padding: 12, borderBottomWidth: 1, borderColor: "#eee" }]}>
            <Text style={styles.questionText}>{item.Question}</Text>
            <AnswerInput question={item} />
        </View>
    );

    if (form?.isPublished !== 1) {
        return (
            <>
                <BackHeader />
                <SafeAreaView style={globalStyles.safeArea}>
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>The form is not yet published</Text>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    if (!isStarted) {
        return (
            <>
                <BackHeader />
                <SafeAreaView style={globalStyles.safeArea}>
                    <View style={[styles.emptyContainer, { margin: 20 }]}>
                        <View
                            style={{
                                backgroundColor: "#fff",
                                padding: 20,
                                borderRadius: 10,
                                marginBottom: 20,
                                borderWidth: 1,
                                borderColor: "#ccc",
                            }}
                        >
                            <CText fontSize={16} style={{ color: "#999" }}>Title</CText>
                            <CText fontStyle={"SB"} fontSize={16} style={{ color: "#999" }}>{form.Title}</CText>
                            <View style={{ marginTop: 10 }}>
                                <CText fontSize={16} style={{ color: "#999" }}>Description</CText>
                                <CText fontStyle={"SB"} fontSize={16} style={{ color: "#999" }}>{form.Description}</CText>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <CText fontSize={16} style={{ color: "#999" }}>Total Questions</CText>
                                <CText fontStyle={"SB"} fontSize={16} style={{ color: "#999" }}>{form?.questions?.length}</CText>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <CText fontSize={16} style={{ color: "#999" }}>Duration</CText>
                                <CText fontStyle={"SB"} fontSize={16} style={{ color: "#999" }}>{form?.Duration} minutes</CText>
                            </View>
                            {response?.TimeStarted && (
                                <View style={{ marginTop: 10 }}>
                                    <CText fontSize={16} style={{ color: "#999" }}>Remaining Time</CText>
                                    <CText fontStyle={"SB"} fontSize={16} style={{ color: "#999" }}>
                                        <SurveyTimer response={response} endSurvey={endSurvey} />
                                    </CText>
                                </View>
                            )}
                        </View>

                        <CButton
                            title={response?.TimeStarted ? "Continue" : "Start"}
                            icon={"play-circle"}
                            type={"success"}
                            style={{
                                marginTop: 20,
                                marginBottom: 20,
                                padding: 12,
                                paddingHorizontal: 20,
                            }}
                            onPress={handleStart}
                        />
                    </View>
                </SafeAreaView>
            </>
        );
    }

    return (
        <>
            <BackHeader
                title={<SurveyTimer response={response} endSurvey={endSurvey} />}
                rightButton={
                    <CButton
                        type="success"
                        title="Submit"
                        icon={"save-outline"}
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 7,
                            borderRadius: 8,
                        }}
                        onPress={() => navigation.navigate("AddQuestionScreen", { sectionId: null })}
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
                            </View>
                        )}
                        contentContainerStyle={{
                            padding: 14,
                            paddingBottom: 80,
                        }}
                        refreshing={refreshing}
                    />
                )}
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
    questionText: {
        fontSize: 17,
        color: "#333",
        flex: 1,
        marginBottom: 10,
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
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    linearScaleCircle: {
        borderWidth: 1,
        borderColor: "#bbb",
        borderRadius: 20,
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    linearScaleText: {
        fontSize: 16,
        color: "#444",
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
});
