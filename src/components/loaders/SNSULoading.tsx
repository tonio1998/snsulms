import React, { useEffect, useRef } from "react";
import { View, Animated, Text, StyleSheet, Easing } from "react-native";
import {AnimatedText} from "react-native-reanimated/lib/typescript/component/Text";
import Svg from "react-native-svg";

export default function SNSULoading() {
    const strokeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(strokeAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(strokeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [strokeAnim]);

    const strokeDasharray = 300; // depende sa laki ng font
    const strokeDashoffset = strokeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [strokeDasharray, 0],
    });

    return (
        <View style={styles.container}>
            <Svg height="100" width="300" viewBox="0 0 300 100">
                <AnimatedText
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    fontSize="60"
                    fontWeight="bold"
                    stroke="#026014"
                    fill="none"
                    strokeWidth="2"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                >
                    SNSU
                </AnimatedText>
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});