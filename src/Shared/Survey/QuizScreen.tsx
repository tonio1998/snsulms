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
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import {
    endSurvey,
    getSurveyData,
    initSurvey,
} from "../../api/testBuilder/testbuilderApi.ts";
import { theme } from "../../theme";
import CButton from "../../components/buttons/CButton.tsx";
import { CText } from "../../components/common/CText.tsx";
import { useLoading } from "../../context/LoadingContext.tsx";
import { handleApiError } from "../../utils/errorHandler.ts";
import { useAlert } from "../../components/CAlert.tsx";
import AnswerInput from "../../components/testBuilder/AnswerInput.tsx";
import { useSurveyTimer } from "../../components/testBuilder/SurveyTimer.tsx";
import {useAuth} from "../../context/AuthContext.tsx";

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function QuizScreen({ navigation, route }) {
    const {user} = useAuth();
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
    const SurveyID = route.params?.SurveyID;
    const RESPONSE = route.params?.response;

    const loadSections = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSurveyData({ SurveyID });
            setForm(data);
            setGamified(data?.isCardView);
            if(RESPONSE?.TimeEnded){
                navigation.replace('ResponsePreview', {
                    formId: SurveyID,
                    userID: user?.id,
                });
            }

            if (data?.isShuffle) {
                const allQs = data.sections.flatMap((sec) => {
                    const shuffledQs = sec.questions.map((q) => {
                        let opts = [];
                        try {
                            opts =
                                typeof q.Options === "string"
                                    ? JSON.parse(q.Options)
                                    : q.Options || [];
                        } catch {
                            opts = [];
                        }
                        return { ...q, _shuffledOptions: shuffleArray(opts) };
                    });
                    return shuffledQs;
                });
                setShuffledQuestions(shuffleArray(allQs));
            } else {
                const allQs = data.sections.flatMap((sec) =>
                    sec.questions.map((q) => {
                        let opts = [];
                        try {
                            opts =
                                typeof q.Options === "string"
                                    ? JSON.parse(q.Options)
                                    : q.Options || [];
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

    const handleSubmitForm = useCallback(async () => {
        const requiredQuestions = sections.flatMap((section) =>
            section.questions.filter((q) => q.isRequired),
        );
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
            await endSurvey(RESPONSE?.id, answers);
            showAlert("success", "Success", "Form has been submitted.");
            setIsStarted(false);
        } catch (error) {
            handleApiError(error, "Submission failed");
        } finally {
            hideLoading();
        }
    }, [answers, RESPONSE, sections, showAlert, showLoading, hideLoading]);

    const QuestionItem = memo(
        ({ question, answer, onChange, isMissing }) => (
            <View
                style={[
                    styles.questionItem,
                    { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
                    isMissing && {
                        borderColor: "red",
                        borderWidth: 1,
                        backgroundColor: "#ffe6e6",
                    },
                ]}
            >
                <Text style={styles.questionText}>
                    {question.Question}
                    {question.isRequired && <Text style={{ color: "red" }}> *</Text>}
                </Text>
                <AnswerInput question={question} answer={answer} onChange={onChange} />
            </View>
        ),
        (prevProps, nextProps) => {
            return (
                prevProps.question === nextProps.question &&
                prevProps.answer === nextProps.answer &&
                prevProps.onChange === nextProps.onChange &&
                prevProps.isMissing === nextProps.isMissing
            );
        },
    );

    const currentQuestion = gamified ? shuffledQuestions[currentQuestionIndex] : null;

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
                        margin: 5,
                        padding: 24,
                        borderRadius: 12,
                        shadowOpacity: 0.3,
                        elevation: 2,
                        backgroundColor: "#fff",
                    },
                ]}
            >
                <Text style={[styles.questionText, { fontSize: 20, marginBottom: 20 }]}>
                    {currentQuestion.Question}
                    {currentQuestion.isRequired && <Text style={{ color: "red" }}> *</Text>}
                </Text>

                <AnswerInput
                    question={currentQuestion}
                    answer={answers[currentQuestion.id]}
                    onChange={handleAnswerChange}
                />

                {isMissing && (
                    <Text style={{ color: "red", marginTop: 10 }}>This question is required.</Text>
                )}

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
                            style={[styles.navButton, disableNext && { opacity: 0.5, backgroundColor: "#ddd" }]}
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
                            <Text style={[styles.navButtonText, { color: disableSubmit ? "#999" : "#fff" }]}>
                                Submit
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 5, backgroundColor: "#eee", marginTop: 20, borderRadius: 3 }}>
                    <View
                        style={{
                            height: 5,
                            width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%`,
                            backgroundColor: theme.colors.light.primary,
                            borderRadius: 3,
                        }}
                    />
                </View>
            </View>
        );
    };

    // if (loading) {
    //     return (
    //         <SafeAreaView style={[globalStyles.container, { justifyContent: "center", alignItems: "center" }]}>
    //             <ActivityIndicator size="large" color={theme.colors.light.primary} />
    //         </SafeAreaView>
    //     );
    // }

    return (
        <SafeAreaView style={[globalStyles.container, {backgroundColor: theme.colors.light.card}]}>
            {/*<BackHeader title={form?.title || "Quiz"} navigation={navigation} />*/}

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20
                }}>
                    <CText fontSize={20} style={{ marginRight: 10 }}>Time:</CText>
                    <CText fontSize={20} fontStyle={'SB'}>0</CText>
                </View>
                {!gamified ? (
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                        keyboardShouldPersistTaps='handled'
                    >
                        {shuffledQuestions.map((question) => (
                            <QuestionItem
                                key={question.id}
                                question={question}
                                answer={answers[question.id]}
                                onChange={(value) => handleAnswerChange(question.id, value)}
                                isMissing={missingRequired.includes(question.id)}
                            />
                        ))}
                        <View style={{ padding: 20 }}>
                            <CButton
                                title="Submit"
                                type={"success"}
                                style={{ padding: 12, borderRadius: 5, width: '100%' }}
                                onPress={handleSubmitForm}
                                disabled={missingRequired.length > 0}
                            />
                        </View>
                    </ScrollView>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                        keyboardShouldPersistTaps='handled'
                    >
                        <GamifiedQuestion />
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    questionItem: {
        marginVertical: 8,
    },
    questionText: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.light.text,
        marginBottom: 8,
    },
    instructions: {
        textAlign: "center",
        color: theme.colors.light.primary,
    },
    navButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: theme.colors.light.primary,
    },
    navButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
