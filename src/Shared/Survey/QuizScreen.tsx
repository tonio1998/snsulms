import React, { useEffect, useState, useCallback, memo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
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
import { useAlert } from "../../components/CAlert.tsx";

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function QuizScreen({ navigation, route }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isStarted, setIsStarted] = useState(false);
    const [form, setForm] = useState({});
    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useAlert();
    const [answers, setAnswers] = useState({});
    const [missingRequired, setMissingRequired] = useState([]);
    const [gamified, setGamified] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);

    const SurveyID = route.params.SurveyID;

    const loadSections = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSurveyData({ SurveyID });
            setForm(data);
            setGamified(data?.isCardView)
            setSections(data?.sections || []);
            const init = await initSurvey(SurveyID);
            if (init) setResponse(init);

            // If shuffle enabled, flatten and shuffle questions for gamified mode
            if (data?.isShuffle) {
                const allQs = data.sections.flatMap((sec) => {
                    // Shuffle choices inside questions too
                    const shuffledQs = sec.questions.map((q) => {
                        let opts = [];
                        try {
                            opts = typeof q.Options === "string" ? JSON.parse(q.Options) : q.Options || [];
                        } catch {
                            opts = [];
                        }
                        return { ...q, _shuffledOptions: shuffleArray(opts) };
                    });
                    return shuffledQs;
                });
                setShuffledQuestions(shuffleArray(allQs));
            } else {
                // no shuffle, but still set _shuffledOptions to original options for consistency
                const allQs = data.sections.flatMap((sec) =>
                    sec.questions.map((q) => {
                        let opts = [];
                        try {
                            opts = typeof q.Options === "string" ? JSON.parse(q.Options) : q.Options || [];
                        } catch {
                            opts = [];
                        }
                        return { ...q, _shuffledOptions: opts };
                    }),
                );
                setShuffledQuestions(allQs);
            }
        } catch (error) {
            handleApiError(error, "dfdf");
            Alert.alert("Error", "Failed to load sections from server.");
        } finally {
            setLoading(false);
        }
    }, [SurveyID]);

    const [response, setResponse] = useState(null);

    useEffect(() => {
        loadSections();
    }, [loadSections]);

    const handleAnswerChange = useCallback((questionId, value) => {
        setAnswers((prev) => {
            if (prev[questionId] === value) return prev;
            return { ...prev, [questionId]: value };
        });
        setMissingRequired((prev) => prev.filter((id) => id !== questionId));
    }, []);

    const handleStart = useCallback(async () => {
        showLoading("Starting...");
        try {
            const res = await startSurvey(response?.id);
            if (res) {
                const startSeconds = Math.max(res?.RemainingTime || 0, 0) * 60;
                await AsyncStorage.setItem(`surveyTimer_${response?.id}`, startSeconds.toString());
                setIsStarted(true);
            }
        } catch (error) {
            handleApiError(error, "Failed to start the survey");
        } finally {
            hideLoading();
        }
    }, [response, showLoading, hideLoading]);

    const handleSubmitForm = useCallback(async () => {
        const requiredQuestions = sections.flatMap((section) => section.questions.filter((q) => q.isRequired));
        const missing = requiredQuestions
            .filter((q) => {
                const ans = answers[q.id];
                if (q.AnswerType === "checkbox") {
                    return !Array.isArray(ans) || ans.length === 0;
                }
                return ans === undefined || ans === null || ans === "";
            })
            .map((q) => q.id);

        if (missing.length > 0) {
            setMissingRequired(missing);
            return;
        } else {
            setMissingRequired([]);
        }

        try {
            showLoading("Submitting the form...");
            await endSurvey(response?.id, answers);  // Pass answers here
            showAlert("success", "Success", "Form has been submitted.");
            setIsStarted(false);
        } catch (error) {
            handleApiError(error, "Submission failed");
        } finally {
            hideLoading();
        }
    }, [answers, response, sections, showAlert, showLoading, hideLoading]);

    const handleTimeUpdate = async (seconds) => {
        setTimeLeft(seconds);

        if(timeLeft === 0){
            await endSurvey(response?.id)
        }
    };

    // Modified AnswerInput to use _shuffledOptions if available
    const AnswerInput = memo(({ question, answer, onChange }) => {
        const parsedChoices = question._shuffledOptions || [];
        switch (question.AnswerType) {
            case "short":
                return (
                    <TextInput
                        style={styles.shortInput}
                        value={answer || ""}
                        onChangeText={(text) => onChange(question.id, text)}
                        placeholder="Your answer"
                        placeholderTextColor="#ccc"
                        blurOnSubmit={false}
                        keyboardShouldPersistTaps="handled"
                    />
                );
            case "par":
                return (
                    <TextInput
                        style={styles.paragraphInput}
                        value={answer || ""}
                        onChangeText={(text) => onChange(question.id, text)}
                        placeholder="Your answer"
                        multiline
                        numberOfLines={4}
                        blurOnSubmit={false}
                        keyboardShouldPersistTaps="handled"
                    />
                );
            case "mc":
                return (
                    <View>
                        {parsedChoices.map((opt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.optionRow}
                                onPress={() => onChange(question.id, opt)}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={answer === opt ? "radio-button-on" : "radio-button-off"}
                                    size={22}
                                    color={answer === opt ? theme.colors.light.primary : "#888"}
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
                        {parsedChoices.map((opt, i) => {
                            const selected = Array.isArray(answer) && answer.includes(opt);
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.optionRow}
                                    onPress={() => {
                                        let newAnswer = Array.isArray(answer) ? [...answer] : [];
                                        if (selected) {
                                            newAnswer = newAnswer.filter((a) => a !== opt);
                                        } else {
                                            newAnswer.push(opt);
                                        }
                                        onChange(question.id, newAnswer);
                                    }}
                                    activeOpacity={0.7}
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
                                    onPress={() => onChange(question.id, val)}
                                    activeOpacity={0.7}
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
    });

    const QuestionItem = memo(({ question, answer, onChange, isMissing }) => (
        <View
            style={[
                styles.questionItem,
                { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
                isMissing && { borderColor: "red", borderWidth: 1, backgroundColor: "#ffe6e6" },
            ]}
        >
            <Text style={styles.questionText}>
                {question.Question}
                {question.isRequired && <Text style={{ color: "red" }}> *</Text>}
            </Text>
            <AnswerInput question={question} answer={answer} onChange={onChange} />
        </View>
    ));

    // Use shuffledQuestions in gamified mode, else sections
    const currentQuestion = gamified ? shuffledQuestions[currentQuestionIndex] : null;

    // Check if required question is answered
    function isQuestionAnswered(q) {
        const ans = answers[q?.id];
        if (q?.AnswerType === "checkbox") {
            return Array.isArray(ans) && ans.length > 0;
        }
        return ans !== undefined && ans !== null && ans !== "";
    }

    const goNext = () => {
        if (!currentQuestion) return;
        if (currentQuestion.isRequired && !isQuestionAnswered(currentQuestion)) {
            Alert.alert("Hold up", "This question is required before moving on.");
            return;
        }
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };
    const goPrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const GamifiedQuestion = () => {
        if (!currentQuestion) return <Text>No questions available</Text>;

        const isMissing = missingRequired.includes(currentQuestion.id);

        const disableNext = currentQuestion.isRequired && !isQuestionAnswered(currentQuestion);
        const disableSubmit = disableNext;

        return (
            <View
                style={[
                    styles.questionItem,
                    {
                        margin: 20,
                        padding: 24,
                        borderRadius: 12,
                        shadowOpacity: 0.3,
                        elevation: 5,
                        backgroundColor: "#fff",
                    },
                ]}
            >
                <Text style={[styles.questionText, { fontSize: 20, marginBottom: 20 }]}>
                    {currentQuestion.Question}
                    {currentQuestion.isRequired && <Text style={{ color: "red" }}> *</Text>}
                </Text>

                <AnswerInput question={currentQuestion} answer={answers[currentQuestion.id]} onChange={handleAnswerChange} />

                {isMissing && <Text style={{ color: "red", marginTop: 10 }}>This question is required.</Text>}

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 30 }}>
                    <TouchableOpacity
                        disabled={currentQuestionIndex === 0}
                        onPress={goPrev}
                        style={[styles.navButton, currentQuestionIndex === 0 && { opacity: 0.5 }]}
                    >
                        <Text style={styles.navButtonText}>Previous</Text>
                    </TouchableOpacity>

                    {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                        <TouchableOpacity
                            disabled={disableNext}
                            onPress={goNext}
                            style={[
                                styles.navButton,
                                disableNext && { opacity: 0.5, backgroundColor: "#ddd" },
                            ]}
                        >
                            <Text style={styles.navButtonText}>Next</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            disabled={disableSubmit}
                            onPress={handleSubmitForm}
                            style={[
                                styles.navButton,
                                disableSubmit
                                    ? { opacity: 0.5, backgroundColor: "#ddd" }
                                    : { backgroundColor: theme.colors.light.primary },
                            ]}
                        >
                            <Text style={[styles.navButtonText, disableSubmit ? {} : { color: "#fff" }]}>Submit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (form?.isPublished !== 1 && form) {
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

    if (!isStarted && form) {
        const textColor = "#555"; // Softer than #999, easier on eyes

        return (
            <>
                <BackHeader />
                <SafeAreaView style={[globalStyles.safeArea, { backgroundColor: "#f9f9f9" }]}>
                    <View style={[styles.emptyContainer, { margin: 20 }]}>
                        <View
                            style={{
                                backgroundColor: "#fff",
                                padding: 25,
                                borderRadius: 12,
                                marginBottom: 30,
                                borderWidth: 1,
                                borderColor: "#e0e0e0",
                                shadowColor: "#000",
                                shadowOpacity: 0.05,
                                shadowRadius: 10,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 3,
                            }}
                        >
                            <CText fontSize={18} style={{ color: textColor, marginBottom: 8, letterSpacing: 1 }}>
                                Title
                            </CText>
                            <CText fontStyle={"SB"} fontSize={20} style={{ color: "#222" }}>
                                {form.Title}
                            </CText>

                            <View style={{ marginTop: 20 }}>
                                <CText fontSize={18} style={{ color: textColor, marginBottom: 8, letterSpacing: 1 }}>
                                    Description
                                </CText>
                                <CText fontStyle={"SB"} fontSize={16} style={{ color: "#444", lineHeight: 22 }}>
                                    {form.Description || "No description provided."}
                                </CText>
                            </View>

                            <View style={styles.infoRow}>
                                <CText fontSize={16} style={{ color: textColor }}>
                                    Total Questions
                                </CText>
                                <CText fontStyle={"SB"} fontSize={16} style={{ color: "#000" }}>
                                    {form?.questions?.length || 0}
                                </CText>
                            </View>

                            <View style={styles.infoRow}>
                                <CText fontSize={16} style={{ color: textColor }}>
                                    Duration
                                </CText>
                                <CText fontStyle={"SB"} fontSize={16} style={{ color: "#000" }}>
                                    {form?.Duration} min
                                </CText>
                            </View>

                            {response?.TimeStarted && (
                                <View style={styles.infoRow}>
                                    <CText fontSize={16} style={{ color: textColor }}>
                                        Remaining Time
                                    </CText>
                                    <SurveyTimer response={response} endSurvey={endSurvey} onTimeUpdate={handleTimeUpdate} />
                                </View>
                            )}
                        </View>

                        <CButton
                            title={response?.TimeStarted ? "Continue" : "Start"}
                            icon={"play-circle"}
                            type={"success"}
                            style={{
                                paddingVertical: 14,
                                paddingHorizontal: 30,
                                borderRadius: 30,
                                shadowColor: "#28a745",
                                shadowOpacity: 0.4,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 5,
                            }}
                            onPress={handleStart}
                        />
                    </View>
                </SafeAreaView>
            </>
        );
    }

    // Count answered questions
    const totalQuestions = gamified
        ? shuffledQuestions.length
        : sections.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0);
    const answeredCount = Object.keys(answers).filter((key) => {
        const val = answers[key];
        if (Array.isArray(val)) return val.length > 0;
        return val !== undefined && val !== null && val !== "";
    }).length;

    return (
        <>
            <BackHeader
                title={
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <SurveyTimer response={response} endSurvey={endSurvey} onTimeUpdate={handleTimeUpdate} />
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                            {answeredCount} / {totalQuestions} answered
                        </Text>
                    </View>
                }
                rightButton={
                    !gamified && answeredCount > 0 ? (
                        <CButton
                            type="success"
                            title="Submit"
                            icon={"save-outline"}
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 7,
                                borderRadius: 8,
                            }}
                            onPress={handleSubmitForm}
                        />
                    ) : null
                }
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                <SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>
                    {loading && <ActivityIndicator size="large" color={theme.colors.light.primary} />}
                    {!loading && (
                        <>
                            {gamified ? (
                                <ScrollView
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <GamifiedQuestion />
                                </ScrollView>
                            ) : (
                                <ScrollView
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {sections.length === 0 ? (
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.emptyText}>No sections found.</Text>
                                        </View>
                                    ) : (
                                        sections.map((section) => (
                                            <View key={section.id.toString()} style={styles.sectionContainer}>
                                                <Text style={styles.sectionTitle}>{section.SectionTitle}</Text>
                                                {section.questions && section.questions.length > 0 ? (
                                                    section.questions.map((question) => (
                                                        <QuestionItem
                                                            key={question.id.toString()}
                                                            question={question}
                                                            answer={answers[question.id]}
                                                            onChange={handleAnswerChange}
                                                            isMissing={missingRequired.includes(question.id)}
                                                        />
                                                    ))
                                                ) : (
                                                    <Text style={styles.noQuestionsText}>No questions yet.</Text>
                                                )}
                                            </View>
                                        ))
                                    )}
                                </ScrollView>
                            )}
                        </>
                    )}
                </SafeAreaView>
            </KeyboardAvoidingView>
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
    navButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: "#eee",
        borderRadius: 8,
    },
    navButtonText: {
        fontWeight: "700",
        fontSize: 16,
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
    toggleButton: {
        position: "absolute",
        top: 10,
        right: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: "#222",
        borderRadius: 8,
        zIndex: 1000,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
    },
});
