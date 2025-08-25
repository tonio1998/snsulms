import React, { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { BlurView } from "@react-native-community/blur";
import {theme} from "../theme";


const circles = Array.from({ length: 10 }).map((_, i) => ({
    key: `${i}`,
    size: Math.floor(Math.random() * 120) + 50,
    top: Math.floor(Math.random() * 400),
    left: Math.floor(Math.random() * 200),
    blur: Math.random() > 0.5,
}));

export default function CircleBackground() {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
        <LinearGradient
            colors={[theme.colors.light.primary, theme.colors.light.secondary]}
            start={{ x: 1, y: 2 }}
            end={{ x: 1.3, y: 1 }}
            style={styles.gradientBg}
        >
            {circles.map(({ key, size, top, left, blur }) => {
                const circleStyle = {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    top,
                    left,
                    position: "absolute",
                    backgroundColor: "rgba(255,255,255,0.3)",
                };

                if (blur) {
                    return (
                        <BlurView
                            key={key}
                            style={circleStyle}
                            blurType="light"
                            blurAmount={15}
                            reducedTransparencyFallbackColor="white"
                        />
                    );
                }

                return (
                    <Animated.View
                        key={key}
                        style={[
                            circleStyle,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    />
                );
            })}

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBg: {
        flex: 1,
    },
    circle: {
        position: "absolute",
        backgroundColor: "rgba(255,255,255,1)",
    },
});
