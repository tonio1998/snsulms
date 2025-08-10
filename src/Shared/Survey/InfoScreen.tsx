import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from "../../theme/styles.ts";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { useLoading } from "../../context/LoadingContext.tsx";
import { useAlert } from "../../components/CAlert.tsx";
import { getSurveyData, updateSurveyData } from "../../api/testBuilder/testbuilderApi.ts";
import { handleApiError } from "../../utils/errorHandler.ts";
import { CText } from "../../components/common/CText.tsx";
import { theme } from "../../theme";

export default function InfoScreen({ navigation, route }) {
    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useAlert();
    const SurveyID = route.params.SurveyID;

    const [data, setData] = useState({});
    const [settings, setSettings] = useState({
        isPublished: 0,
        isLimited: 0,
        isProgress: 0,
        isShuffle: 0,
        autosave_enabled: 0,
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        showLoading('Loading...');
        try {
            const res = await getSurveyData({ SurveyID });
            setData(res);
            setSettings({
                isPublished: res.isPublished ? 1 : 0,
                isLimited: res.isLimited ? 1 : 0,
                isProgress: res.isProgress ? 1 : 0,
                isShuffle: res.isShuffle ? 1 : 0,
                autosave_enabled: res.autosave_enabled ? 1 : 0,
            });
        } catch (error) {
            handleApiError(error, 'Fetching data');
        } finally {
            hideLoading();
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleSetting = (key) => {
        setSettings((prev) => ({ ...prev, [key]: prev[key] ? 0 : 1 }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        showLoading('Saving...');
        try {
            await updateSurveyData(SurveyID, settings);
            showAlert('success', 'Success', 'Settings updated successfully.');
        } catch (error) {
            handleApiError(error, 'Updating data');
        } finally {
            hideLoading();
            setIsSaving(false);
        }
    };

    const settingCards = [
        {
            label: 'Publish Form',
            key: 'isPublished',
            description: 'Make the form visible and accessible for participants.',
        },
        {
            label: 'Limit to 1 Response per Account',
            key: 'isLimited',
            description: 'Restrict participants to submit only one response.',
        },
        {
            label: 'Show Form Progress to Students',
            key: 'isProgress',
            description: 'Display a progress bar while the participant answers.',
        },
        {
            label: 'Shuffle Questions',
            key: 'isShuffle',
            description: 'Randomize the order of questions for each participant.',
        },
        {
            label: 'Enable Autosave',
            key: 'autosave_enabled',
            description: 'Save responses automatically as the participant answers.',
        },
    ];

    return (
        <>
            <BackHeader title="Info" />
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={styles.cardHeader}>
                    <CText>Title</CText>
                    <CText fontSize={17} fontStyle="B">{data.Title || 'Untitled Form'}</CText>
                    {data.Description ? (
                        <CText fontSize={15} style={styles.descText}>{data.Description}</CText>
                    ) : null}
                </View>
                <ScrollView contentContainerStyle={styles.container}>
                    <CText fontSize={18} fontStyle="SB" style={styles.sectionTitle}>Quick Settings</CText>
                    {settingCards.map(({ label, key, description }) => (
                        <View key={key} style={styles.card}>
                            <View style={styles.cardContent}>
                                <View style={{ flex: 1 }}>
                                    <CText fontSize={16} fontStyle="SB">{label}</CText>
                                    <CText fontSize={13} style={styles.settingDesc}>{description}</CText>
                                </View>
                                <Switch
                                    value={!!settings[key]}
                                    onValueChange={() => toggleSetting(key)}
                                    trackColor={{ false: '#ccc', true: theme.colors.light.primary }}
                                    thumbColor={'#fff'}
                                />
                            </View>
                        </View>
                    ))}

                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave} disabled={isSaving}>
                            <CText fontSize={16} fontStyle="SB" style={{ color: '#fff' }}>Save Changes</CText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    cardHeader: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#eee',
        marginHorizontal: 20
    },
    descText: {
        marginTop: 4,
        color: '#666',
    },
    sectionTitle: {
        marginBottom: 12,
        marginTop: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingDesc: {
        marginTop: 4,
        color: '#777',
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    btn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    saveBtn: {
        backgroundColor: theme.colors.light.primary,
    },
    deleteBtn: {
        backgroundColor: '#e74c3c',
    },
});
