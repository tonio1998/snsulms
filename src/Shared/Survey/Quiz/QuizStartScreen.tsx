import React, { useEffect, useState, useCallback } from "react";
import { View, SafeAreaView, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackHeader from "../../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../../theme/styles.ts";
import {endSurvey, getSurveyData, initSurvey, startSurvey} from "../../../api/testBuilder/testbuilderApi.ts";
import { theme } from "../../../theme";
import CButton from "../../../components/buttons/CButton.tsx";
import { CText } from "../../../components/common/CText.tsx";
import SurveyTimer, {useSurveyTimer} from "../../../components/testBuilder/SurveyTimer.tsx";
import { useLoading } from "../../../context/LoadingContext.tsx";
import { handleApiError } from "../../../utils/errorHandler.ts";
import { useAlert } from "../../../components/CAlert.tsx";
import {formatTime} from "../../../utils/format.ts";

export default function QuizStartScreen({ navigation, route }) {
    const [form, setForm] = useState(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useAlert();
    const Duration = route.params?.Duration || 0;
    const ActivityID = route.params?.ActivityID || 0;

    console.log("FormStatus: ", route.params);

    const SurveyID = route.params.SurveyID;

    const loadLocal = async () => {
        try {
            const data = await getSurveyData({ SurveyID });
            setForm(data);
        } catch (error) {
            handleApiError(error, 'Failed to load survey');
        } finally {
            setLoading(false);
        }
    };

    const loadSurvey = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSurveyData({ SurveyID });
            setForm(data);

            const init = await initSurvey(SurveyID, Duration, ActivityID);
            console.log('🔍 Fetched survey', data);
            if (init) setResponse(init);
        } catch (error) {
            handleApiError(error, "Failed to load survey");
        } finally {
            setLoading(false);
        }
    }, [SurveyID]);

    useEffect(() => {
        loadSurvey();
    }, [loadSurvey]);

    const handleStart = async () => {
        showLoading("Starting...");
        try {
            const res = await startSurvey(response?.id);
            if (res) {
                const startSeconds = Math.max(res?.RemainingTime || 0, 0);
                await AsyncStorage.setItem(`surveyTimer_${response?.id}`, startSeconds.toString());
                await AsyncStorage.setItem('SurveyStatus_'+response?.id, '1');

                navigation.navigate("QuizScreen", { SurveyID, response: res, form });
            }
        } catch (error) {
            handleApiError(error, "Failed to start the survey");
        } finally {
            hideLoading();
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={globalStyles.safeArea}>
                <ActivityIndicator size="large" color={theme.colors.light.primary} />
            </SafeAreaView>
        );
    }

    if (!form?.isPublished) {
        return (
            <>
                <BackHeader />
                <SafeAreaView style={globalStyles.safeArea}>
                    <View style={styles.emptyContainer}>
                        <CText>The form is not yet published</CText>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    const textColor = "#555";

    return (
        <>
            <BackHeader />
            <SafeAreaView style={[globalStyles.safeArea]}>
                <View style={[styles.container, { margin: 20 }]}>
                    <View style={styles.card}>
                        <CText fontSize={18} style={{ color: textColor, marginBottom: 8 }}>
                            Title
                        </CText>
                        <CText fontStyle={"SB"} fontSize={20} style={{ color: "#222" }}>
                            {form.Title}
                        </CText>

                        <View style={{ marginTop: 20 }}>
                            <CText fontSize={18} style={{ color: textColor, marginBottom: 8 }}>
                                Description
                            </CText>
                            <CText fontStyle={"SB"} fontSize={16} style={{ color: "#444" }}>
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
                                {formatTime(form?.Duration)}
                            </CText>
                        </View>
                        <View style={styles.infoRow}>
                            <CText fontSize={16} style={{ color: textColor }}>
                                Remaining Time
                            </CText>
                            <CText fontStyle={"SB"} fontSize={16} style={{ color: "#000" }}>
                                {formatTime(response?.RemainingTime)}
                            </CText>
                        </View>
                    </View>

                    <CButton
                        title={response?.TimeStarted ? "Continue" : "Start"}
                        icon={"play-circle"}
                        type={"success"}
                        style={{ padding: 12, borderRadius: 5, width: '100%' }}
                        onPress={handleStart}
                    />
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: {
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 12,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
