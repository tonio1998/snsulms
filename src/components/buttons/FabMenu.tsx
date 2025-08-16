import React, { useRef, useState } from "react";
import { Animated, TouchableOpacity, StyleSheet, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {CText} from "../common/CText.tsx";

export default function FabMenu({
                                    fabColor = "red",
                                    fabSize = 60,
                                    fabIcon = "add",
                                    iconColor = "#fff",
                                    iconSize = 28,
                                    options = [],
                                    radius = 100,
                                    startAngle = -90,
                                    spacingAngle = 45,
                                    position = { bottom: 20, right: 20 },
                                }) {
    const [open, setOpen] = useState(false);
    const animations = useRef(options.map(() => new Animated.Value(0))).current;

    const toggleMenu = () => {
        const toValue = open ? 0 : 1;
        Animated.parallel(
            animations.map(anim =>
                Animated.spring(anim, { toValue, useNativeDriver: true })
            )
        ).start();
        setOpen(!open);
    };

    const getOptionStyle = (index) => {
        const angleDeg = startAngle + index * spacingAngle;
        const radians = (angleDeg * Math.PI) / 180;
        return {
            transform: [
                {
                    translateX: animations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.cos(radians) * radius],
                    }),
                },
                {
                    translateY: animations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.sin(radians) * radius],
                    }),
                },
            ],
        };
    };

    return (
        <View style={[styles.container, position]}>
            {options.map((opt, index) => (
                <Animated.View
                    key={index}
                    style={[styles.optionWrapper, getOptionStyle(index)]}
                >
                    <TouchableOpacity
                        style={[
                            styles.option,
                            { backgroundColor: opt.color || "#FFD700" },
                        ]}
                        onPress={opt.onPress}
                    >
                        <Ionicons name={opt.icon || "ellipse"} size={20} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
            ))}

            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        backgroundColor: open ? '#EF7A5F' : fabColor,
                        width: fabSize,
                        height: fabSize,
                        borderRadius: fabSize / 2,
                    },
                ]}
                onPress={toggleMenu}
            >
                <Ionicons name={open ? 'close' : fabIcon} size={iconSize} color={iconColor} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    optionWrapper: {
        position: "absolute",
    },
    option: {
        width: 55,
        height: 55,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        // elevation: 4,
    },
    fab: {
        elevation: 3,
        justifyContent: "center",
        alignItems: "center",
    },
});
