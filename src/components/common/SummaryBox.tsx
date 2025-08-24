import {View} from "react-native";
import {CText} from "./CText.tsx";
import React from "react";

export const SummaryBox = ({ label, value }) => (
    <View style={styles.summaryBox}>
        <CText fontStyle="SB" fontSize={22}>{value}</CText>
        <CText fontSize={12} style={styles.summaryLabel}>{label}</CText>
    </View>
);

const styles = {
    summaryBox: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        color: '#666',
        marginTop: 2,
    },
};