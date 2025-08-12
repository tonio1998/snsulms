import React from "react";
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { globalStyles } from "../../theme/styles";
import { CText } from "../../components/common/CText";
import Icon from "react-native-vector-icons/Ionicons";
import {theme} from "../../theme";

export default function ResponsePreviewScreen({ navigation, route }) {
    const { form, response, SurveyID, message } = route.params;
    const textColor = "#555";

    return (
        <SafeAreaView style={[globalStyles.container, styles.safeArea]}>
            <View style={styles.card}>
                <Icon name="checkmark-circle" size={50} style={styles.icon} />
                <CText fontSize={22} style={styles.title}>
                    Completed
                </CText>
                <CText fontSize={16} style={styles.message}>
                    {message ? message : "You have already completed the this questionnaire."}
                </CText>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("MainTabs")}
                    activeOpacity={0.7}
                >
                    <CText fontSize={16} style={styles.buttonText}>
                        Go Back
                    </CText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    icon: {
        marginBottom: 12,
    },
    safeArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: "#fff",
    },
    card: {
        // backgroundColor: "#fff",
        padding: 30,
        borderRadius: 16,
        // borderWidth: 1,
        borderColor: "#ddd",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // elevation: 5,
        width: "100%",
        maxWidth: 360,
        alignItems: "center",
    },
    icon: {
        marginBottom: 12,
        color: "#4CAF50",
    },
    title: {
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
        textAlign: "center",
    },
    message: {
        color: "#555",
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 22,
    },
    button: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 12,
        paddingHorizontal: 36,
        borderRadius: 30,
        alignSelf: "stretch",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        textAlign: "center",
    },
});
