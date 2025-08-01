import React, {useEffect, useState} from "react";
import {
    View,
    TextInput,
    Linking,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createGoogleMeet } from "../../utils/gmeet/gmeet.ts";
import { handleApiError } from "../../utils/errorHandler.ts";
import { theme } from "../../theme";
import { CText } from "../../components/common/CText";
import BackHeader from "../../components/layout/BackHeader.tsx";
import { globalStyles } from "../../theme/styles.ts";
import {getClassInfo} from "../../api/modules/classesApi.ts";
import {postWall} from "../../api/modules/wallApi.ts";
import {useLoading} from "../../context/LoadingContext.tsx";
import {WebView} from "react-native-webview";

const GMeetingScreen = ({ navigation, route }) => {
    const { ClassID } = route.params;
    const { showLoading, hideLoading } = useLoading();
    const [title, setTitle] = useState("SNSU Class Meeting");
    const [type, setType] = useState("instant");
    const [date, setDate] = useState(new Date(Date.now() + 10 * 60 * 1000));
    const [showPicker, setShowPicker] = useState(null); // 'date' | 'time' | null
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <BackHeader title="Create Meeting" />
            <WebView
                source={{ uri: 'https://meet.google.com/abc-defg-hij' }}
                style={{ flex: 1 }}
                javaScriptEnabled
                domStorageEnabled
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 80,
    },
    label: {
        fontSize: 16,
        marginBottom: 6,
        fontWeight: "600",
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        color: "#222",
    },
    typeButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        marginRight: 8,
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    activeType: {
        backgroundColor: theme.colors.light.primary,
        borderColor: theme.colors.light.primary,
    },
    typeText: {
        fontWeight: "500",
        fontSize: 15,
        color: "#555",
    },
    activeText: {
        color: "#fff",
    },
    pickerButton: {
        backgroundColor: theme.colors.light.primary + "15",
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
    },
    pickerText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#333",
    },
    createButton: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    disabled: {
        opacity: 0.6,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default GMeetingScreen;
