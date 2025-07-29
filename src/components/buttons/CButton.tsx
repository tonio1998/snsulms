import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from '../../theme';
import LinearGradient from 'react-native-linear-gradient';

interface ButtonProps {
    title: string;
    type: "danger" | "success" | "warning" | "info";
    icon: string;
    onPress: () => void;
    padding?: number;
    style?: ViewStyle;
    textStyle?: TextStyle;
    iconSize?: number;
}

const CButton: React.FC<ButtonProps> = ({
                                            title,
                                            type,
                                            icon,
                                            onPress,
                                            padding = 8,
                                            style,
                                            textStyle,
                                            iconSize = 20,
                                        }) => {
    const buttonColors: Record<string, string> = {
        danger: theme.colors.light.danger,
        success: theme.colors.light.primary,
        success_soft: theme.colors.light.primary +'44',
        warning: theme.colors.light.warning,
        info: theme.colors.light.info,
        secondary: theme.colors.light.secondary,
        muted: theme.colors.light.muted,
    };
    
    return (
        <TouchableOpacity
            style={[
                styles.button,
                { padding, 
                    backgroundColor: buttonColors[type],
                    shadowColor: buttonColors[type],
                 },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {icon && (
                    <Icon name={icon} size={iconSize} color={textStyle?.color || "#fff"} />
                )}
                
                {title && (
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 5,
        
        // Glow effect using shadow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 20,
        elevation: 5,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default CButton;
