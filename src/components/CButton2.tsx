import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { PrimaryColor } from "../context/ThemeContext.tsx";

interface ButtonProps {
    title: string;
    type: "danger" | "success" | "warning" | "info";
    icon: string;
    onPress: () => void;
    style?: ViewStyle; // Allow custom styles, including padding & margin
}

const CButton2: React.FC<ButtonProps> = ({ title, type, icon, onPress, style }) => {
    const buttonColors = {
        danger: '211, 47, 47',
        success: `${PrimaryColor}`,
        warning: '245, 124, 0',
        info: '25, 118, 210',
        secondary: '255,255,255',
    };

    return (
        <View style={[
            styles.wrapper,
            { backgroundColor: `rgba(${buttonColors[type]}, .15)` },
            style
        ]}>
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <View style={styles.content}>
                    {icon && (
                      <Icon name={icon} size={20} color={`rgb(${buttonColors[type]})`} />
                    )}
                    <Text style={[styles.text, { color: `rgb(${buttonColors[type]})` }]}>{title}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 5,
        marginBottom: 10,
        // padding: 8,
    },
    button: {
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        // marginVertical: 5,
        // paddingHorizontal: 15,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
    },
});

export default CButton2;
