import React, { useRef, useState } from "react";
import { Animated, TouchableOpacity, StyleSheet, View, Pressable, Dimensions, Easing } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CText } from "../common/CText.tsx";

export default function FabMenu({
                                    fabColor = "red",
                                    fabSize = 60,
                                    fabIcon = "add",
                                    iconColor = "#fff",
                                    iconSize = 28,
                                    options = [],
                                    rightOffset = 15,
                                    spacing = 70,
                                }) {
    const [open, setOpen] = useState(false);
    const animations = useRef(options.map(() => new Animated.Value(0))).current;

    const toggleMenu = () => {
        const toValue = open ? 0 : 1;
        const animatedList = animations.map((anim, index) =>
            Animated.timing(anim, {
                toValue,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            })
        );

        Animated.stagger(50, open ? animatedList.reverse() : animatedList).start();
        setOpen(!open);
    };

    const getOptionStyle = (index) => ({
        transform: [
            {
                translateY: animations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -spacing * (index + 1)],
                }),
            },
            {
                scale: animations[index].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
            },
        ],
        opacity: animations[index],
    });

    return (
        <View style={{ position: "absolute", bottom: 15, right: rightOffset, alignItems: "flex-end" }}>
            {options.map((opt, index) => (
                <Animated.View key={index} style={[styles.optionWrapper, getOptionStyle(index)]}>
                    <TouchableOpacity
                        style={[styles.option, { backgroundColor: opt.color || "#FF7A59" }]}
                        onPress={opt.onPress}
                    >
                        <CText style={styles.optionLabel}>{opt.label || "Option"}</CText>
                    </TouchableOpacity>
                </Animated.View>
            ))}

            <TouchableOpacity
                style={[
                    styles.fab,
                    { backgroundColor: open ? "#EF7A5F" : fabColor, width: fabSize, height: fabSize, borderRadius: fabSize / 2 },
                ]}
                onPress={toggleMenu}
            >
                <Ionicons name={open ? "close" : fabIcon} size={iconSize} color={iconColor} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    optionWrapper: {
        position: "absolute",
        right: 0,
        alignItems: "flex-end",
    },
    option: {
        minWidth: 140,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        // elevation: 6,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    optionLabel: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    fab: {
        elevation: 8,
        justifyContent: "center",
        alignItems: "center",
    },
});
